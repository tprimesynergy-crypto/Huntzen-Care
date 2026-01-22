# 🔧 BACKEND NESTJS - CODE COMPLET

## 📋 TABLE DES MATIÈRES

1. [Configuration Globale](#1-configuration-globale)
2. [Modules Auth & RBAC](#2-modules-auth--rbac)
3. [Module Companies](#3-module-companies)
4. [Module Consultations](#4-module-consultations)
5. [Module Medical (Protégé)](#5-module-medical-protégé)
6. [Module Metrics (Compteurs)](#6-module-metrics-compteurs)
7. [Chat Gateway (WebSocket)](#7-chat-gateway-websocket)
8. [Services Techniques](#8-services-techniques)

---

## 1. CONFIGURATION GLOBALE

### **1.1 Main.ts**

**Fichier** : `apps/api/src/main.ts`

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // ========== SÉCURITÉ ==========
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ========== CORS ==========
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  });

  // ========== VALIDATION GLOBALE ==========
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // Supprime propriétés inconnues
      forbidNonWhitelisted: true,    // Throw error si propriété inconnue
      transform: true,                // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // ========== SWAGGER ==========
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("HuntZen Care API")
      .setDescription("API MHaaS - Multi-tenant, RBAC strict, Secret médical absolu")
      .setVersion("1.0")
      .addBearerAuth()
      .addTag("auth", "Authentification")
      .addTag("companies", "Gestion entreprises")
      .addTag("employees", "Gestion employés")
      .addTag("practitioners", "Gestion praticiens")
      .addTag("consultations", "Consultations & RDV")
      .addTag("medical", "Contenu médical (notes, journal)")
      .addTag("metrics", "Compteurs & usage")
      .addTag("content", "Blog & News")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  // ========== DÉMARRAGE ==========
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  🚀 HuntZen Care API démarrée sur le port ${port}
  📖 Swagger UI : http://localhost:${port}/api/docs
  🔒 Mode : ${process.env.NODE_ENV || "development"}
  `);
}

bootstrap();
```

---

### **1.2 App Module**

**Fichier** : `apps/api/src/app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

// Auth
import { AuthModule } from "./auth/auth.module";
import { RbacService } from "./auth/rbac/rbac.service";

// Modules métier
import { CompaniesModule } from "./modules/companies/companies.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { PractitionersModule } from "./modules/practitioners/practitioners.module";
import { ConsultationsModule } from "./modules/consultations/consultations.module";
import { MedicalModule } from "./modules/medical/medical.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { ContentModule } from "./modules/content/content.module";
import { ChatModule } from "./modules/chat/chat.module";

// Infra
import { PrismaModule } from "./infra/prisma/prisma.module";
import { RedisModule } from "./infra/redis/redis.module";

@Module({
  imports: [
    // ========== CONFIG ==========
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),

    // ========== RATE LIMITING ==========
    ThrottlerModule.forRoot({
      ttl: 60,         // 60 secondes
      limit: 100,      // 100 requêtes max
    }),

    // ========== INFRA ==========
    PrismaModule,
    RedisModule,

    // ========== AUTH ==========
    AuthModule,

    // ========== MODULES MÉTIER ==========
    CompaniesModule,
    EmployeesModule,
    PractitionersModule,
    ConsultationsModule,
    MedicalModule,       // ⚠️ Protégé par NoMedicalGuard
    MetricsModule,       // Compteurs
    ContentModule,
    ChatModule,
  ],
  providers: [
    RbacService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate limiting global
    },
  ],
})
export class AppModule {}
```

---

## 2. MODULES AUTH & RBAC

### **2.1 Auth Module**

**Fichier** : `apps/api/src/auth/auth.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RbacService } from "./rbac/rbac.service";
import { PrismaModule } from "../infra/prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: config.get<string>("JWT_EXPIRES_IN", "15m"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RbacService],
  exports: [AuthService, RbacService],
})
export class AuthModule {}
```

---

### **2.2 Auth Controller**

**Fichier** : `apps/api/src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Créer un compte" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Se connecter" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Se déconnecter" })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Utilisateur courant" })
  async me(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rafraîchir le token" })
  async refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}
```

---

### **2.3 Auth Service**

**Fichier** : `apps/api/src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../infra/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  /**
   * REGISTER
   */
  async register(dto: RegisterDto) {
    // Vérifier email unique
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException("Email déjà utilisé");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Créer user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: dto.roleId,
        companyId: dto.companyId,
        isActive: false,        // À activer par email
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // TODO: Envoyer email vérification

    return {
      user,
      message: "Compte créé. Vérifiez votre email pour l'activer.",
    };
  }

  /**
   * LOGIN
   */
  async login(dto: LoginDto) {
    // Trouver user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    // Vérifier password
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    // Vérifier compte actif
    if (!user.isActive) {
      throw new UnauthorizedException("Compte non activé");
    }

    if (!user.isVerified) {
      throw new UnauthorizedException("Email non vérifié");
    }

    // Générer tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Sauvegarder refresh token (hasheté)
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    // Mettre à jour lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.key,
        companyId: user.companyId,
      },
    };
  }

  /**
   * LOGOUT
   */
  async logout(userId: string) {
    // Supprimer tous les refresh tokens de l'utilisateur
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: "Déconnexion réussie" };
  }

  /**
   * GET PROFILE
   */
  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
      },
    });
  }

  /**
   * REFRESH TOKEN
   */
  async refresh(refreshToken: string) {
    try {
      // Vérifier JWT
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Vérifier token en DB
      const tokens = await this.prisma.refreshToken.findMany({
        where: { userId: payload.sub },
      });

      const valid = await Promise.any(
        tokens.map((t) => bcrypt.compare(refreshToken, t.token))
      );

      if (!valid) {
        throw new Error("Invalid token");
      }

      // Générer nouveau access token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      const newAccessToken = this.generateAccessToken(user);

      // Rotation refresh token (optionnel)
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException("Token invalide ou expiré");
    }
  }

  /**
   * HELPERS
   */
  private generateAccessToken(user: any): string {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role.key,
      companyId: user.companyId,
    });
  }

  private generateRefreshToken(user: any): string {
    return this.jwt.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "7d",
      }
    );
  }
}
```

---

## 3. MODULE COMPANIES

### **3.1 Companies Controller**

**Fichier** : `apps/api/src/modules/companies/companies.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../auth/rbac/roles.enum";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@ApiTags("companies")
@Controller("companies")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(Role.R2_HUNTZEN_ADMIN)
  @ApiOperation({ summary: "Créer une entreprise (Admin HuntZen)" })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  @Roles(Role.R2_HUNTZEN_ADMIN)
  @ApiOperation({ summary: "Liste entreprises (Admin HuntZen)" })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(":id")
  @Roles(Role.R2_HUNTZEN_ADMIN, Role.R3_COMPANY_RH)
  @ApiOperation({ summary: "Détails entreprise" })
  findOne(@Param("id") id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.R2_HUNTZEN_ADMIN, Role.R3_COMPANY_RH)
  @ApiOperation({ summary: "Mettre à jour entreprise" })
  update(@Param("id") id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Post(":id/activate")
  @Roles(Role.R2_HUNTZEN_ADMIN)
  @ApiOperation({ summary: "Activer une entreprise" })
  activate(@Param("id") id: string) {
    return this.companiesService.activate(id);
  }
}
```

---

## 4. MODULE CONSULTATIONS

### **4.1 Consultations Controller**

**Fichier** : `apps/api/src/modules/consultations/consultations.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermsGuard } from "../../common/guards/perms.guard";
import { Perms } from "../../common/decorators/perms.decorator";
import { Perm } from "../../auth/rbac/permissions";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ConsultationsService } from "./consultations.service";
import { CreateConsultationDto } from "./dto/create-consultation.dto";

@ApiTags("consultations")
@Controller("consultations")
@UseGuards(JwtAuthGuard, PermsGuard)
@ApiBearerAuth()
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @Perms(Perm.BOOKING_CREATE)
  @ApiOperation({ summary: "Réserver une consultation (Employé)" })
  create(@CurrentUser() user: any, @Body() dto: CreateConsultationDto) {
    return this.consultationsService.create(user.id, dto);
  }

  @Get("my")
  @Perms(Perm.CONSULTATIONS_MY_READ)
  @ApiOperation({ summary: "Mes consultations" })
  findMy(@CurrentUser() user: any) {
    return this.consultationsService.findByUser(user.id, user.role);
  }

  @Get(":id")
  @ApiOperation({ summary: "Détails consultation" })
  findOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.consultationsService.findOne(id, user.id, user.role);
  }

  @Post(":id/start")
  @Perms(Perm.CONSULTATIONS_OWN_WRITE)
  @ApiOperation({ summary: "Démarrer consultation (Praticien)" })
  start(@CurrentUser() user: any, @Param("id") id: string) {
    return this.consultationsService.start(id, user.id);
  }

  @Post(":id/end")
  @Perms(Perm.CONSULTATIONS_OWN_WRITE)
  @ApiOperation({
    summary: "Terminer consultation (Praticien)",
    description: "Calcule automatiquement duration_seconds et met à jour les compteurs",
  })
  end(@CurrentUser() user: any, @Param("id") id: string) {
    return this.consultationsService.end(id, user.id);
  }

  @Post(":id/cancel")
  @Perms(Perm.BOOKING_CANCEL_OWN)
  @ApiOperation({ summary: "Annuler consultation" })
  cancel(@CurrentUser() user: any, @Param("id") id: string) {
    return this.consultationsService.cancel(id, user.id);
  }
}
```

---

### **4.2 Consultations Service**

**Fichier** : `apps/api/src/modules/consultations/consultations.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { CreateConsultationDto } from "./dto/create-consultation.dto";

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * CRÉER UNE CONSULTATION
   */
  async create(employeeId: string, dto: CreateConsultationDto) {
    // Vérifier disponibilité praticien (TODO)

    // Créer consultation
    const consultation = await this.prisma.consultation.create({
      data: {
        companyId: dto.companyId,
        employeeId,
        practitionerId: dto.practitionerId,
        type: dto.type,
        scheduledAt: dto.scheduledAt,
        status: "scheduled",
        jitsiRoom: `huntzen-${Date.now()}-${Math.random().toString(36)}`,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
        practitioner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // TODO: Envoyer notifications

    return consultation;
  }

  /**
   * MES CONSULTATIONS
   */
  async findByUser(userId: string, role: string) {
    const where = role === "R5_EMPLOYEE"
      ? { employeeId: userId }
      : { practitionerId: userId };

    return this.prisma.consultation.findMany({
      where,
      orderBy: { scheduledAt: "desc" },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
        practitioner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  /**
   * DÉTAILS CONSULTATION
   */
  async findOne(id: string, userId: string, role: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        employee: true,
        practitioner: true,
      },
    });

    if (!consultation) {
      throw new NotFoundException("Consultation introuvable");
    }

    // Vérifier accès
    const isParticipant =
      consultation.employeeId === userId ||
      consultation.practitionerId === userId;

    if (!isParticipant && !["R1_PSG_SUPER", "R2_HUNTZEN_ADMIN"].includes(role)) {
      throw new ForbiddenException("Accès refusé");
    }

    return consultation;
  }

  /**
   * DÉMARRER CONSULTATION (Praticien)
   */
  async start(consultationId: string, practitionerId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException("Consultation introuvable");
    }

    if (consultation.practitionerId !== practitionerId) {
      throw new ForbiddenException("Non autorisé");
    }

    if (consultation.status !== "scheduled" && consultation.status !== "confirmed") {
      throw new ForbiddenException("Consultation déjà démarrée ou terminée");
    }

    // Mettre à jour
    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "in_progress",
        startedAt: new Date(),
      },
    });
  }

  /**
   * TERMINER CONSULTATION (Praticien)
   * ⚠️ CRITIQUE : Le trigger DB calcule duration_seconds et met à jour les compteurs
   */
  async end(consultationId: string, practitionerId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException("Consultation introuvable");
    }

    if (consultation.practitionerId !== practitionerId) {
      throw new ForbiddenException("Non autorisé");
    }

    if (consultation.status !== "in_progress") {
      throw new ForbiddenException("Consultation non en cours");
    }

    if (!consultation.startedAt) {
      throw new ForbiddenException("Consultation non démarrée");
    }

    // Mettre à jour
    // ✅ Le trigger PostgreSQL calcule automatiquement duration_seconds
    // ✅ Le trigger met à jour practitioner_activity_daily, employee_activity_daily, company_activity_daily
    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "completed",
        endedAt: new Date(),
      },
    });
  }

  /**
   * ANNULER CONSULTATION
   */
  async cancel(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException("Consultation introuvable");
    }

    const isParticipant =
      consultation.employeeId === userId ||
      consultation.practitionerId === userId;

    if (!isParticipant) {
      throw new ForbiddenException("Non autorisé");
    }

    // Mettre à jour
    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "cancelled",
      },
    });
  }
}
```

---

## 5. MODULE MEDICAL (PROTÉGÉ)

### **5.1 Medical Controller** ⚠️

**Fichier** : `apps/api/src/modules/medical/medical.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { NoMedicalForAdminsGuard } from "../../common/guards/no-medical.guard";
import { PermsGuard } from "../../common/guards/perms.guard";
import { Perms } from "../../common/decorators/perms.decorator";
import { Perm } from "../../auth/rbac/permissions";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MedicalService } from "./medical.service";
import { CreateClinicalNoteDto } from "./dto/create-clinical-note.dto";
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto";

@ApiTags("medical")
@Controller("medical")
@UseGuards(JwtAuthGuard, NoMedicalForAdminsGuard, PermsGuard)
@ApiBearerAuth()
export class MedicalController {
  constructor(private readonly medicalService: MedicalService) {}

  // ========== NOTES CLINIQUES (Praticien uniquement) ==========

  @Post("clinical-notes")
  @Perms(Perm.CLINICAL_NOTES_OWN_WRITE)
  @ApiOperation({
    summary: "Créer note clinique (Praticien uniquement)",
    description: "Contenu chiffré AES-256-GCM avant stockage",
  })
  createClinicalNote(
    @CurrentUser() user: any,
    @Body() dto: CreateClinicalNoteDto,
  ) {
    return this.medicalService.createClinicalNote(user.id, dto);
  }

  @Get("clinical-notes/:consultationId")
  @Perms(Perm.CLINICAL_NOTES_OWN_READ)
  @ApiOperation({ summary: "Lire note clinique (Praticien auteur uniquement)" })
  getClinicalNote(
    @CurrentUser() user: any,
    @Param("consultationId") consultationId: string,
  ) {
    return this.medicalService.getClinicalNote(consultationId, user.id);
  }

  // ========== JOURNAL EMPLOYÉ (Employé uniquement) ==========

  @Post("journal")
  @Perms(Perm.JOURNAL_OWN_WRITE)
  @ApiOperation({
    summary: "Créer entrée journal (Employé uniquement)",
    description: "Contenu chiffré AES-256-GCM avant stockage",
  })
  createJournalEntry(
    @CurrentUser() user: any,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.medicalService.createJournalEntry(user.id, dto);
  }

  @Get("journal")
  @Perms(Perm.JOURNAL_OWN_READ)
  @ApiOperation({ summary: "Liste journal (Employé uniquement)" })
  getJournal(@CurrentUser() user: any) {
    return this.medicalService.getJournal(user.id);
  }
}
```

---

## 6. MODULE METRICS (COMPTEURS)

### **6.1 Metrics Controller**

**Fichier** : `apps/api/src/modules/metrics/metrics.controller.ts`

```typescript
import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermsGuard } from "../../common/guards/perms.guard";
import { Perms } from "../../common/decorators/perms.decorator";
import { Perm } from "../../auth/rbac/permissions";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MetricsService } from "./metrics.service";

@ApiTags("metrics")
@Controller("metrics")
@UseGuards(JwtAuthGuard, PermsGuard)
@ApiBearerAuth()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  // ========== PRATICIEN : Compteurs pour paiement ==========

  @Get("practitioners/:id")
  @Perms(Perm.METRICS_PRACTITIONER_USAGE_READ)
  @ApiOperation({
    summary: "Compteurs praticien (pour paiement hors plateforme)",
    description: "Retourne nb consultations + durée totale + breakdown par période",
  })
  getPractitionerMetrics(
    @CurrentUser() user: any,
    @Param("id") practitionerId: string,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.metricsService.getPractitionerMetrics(practitionerId, from, to);
  }

  @Get("practitioners/:id/export")
  @Perms(Perm.EXPORTS_PRACTITIONER_USAGE)
  @ApiOperation({ summary: "Export CSV praticien (pour comptabilité)" })
  exportPractitionerMetrics(
    @CurrentUser() user: any,
    @Param("id") practitionerId: string,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.metricsService.exportPractitionerCSV(practitionerId, from, to);
  }

  // ========== RH : Compteurs employés (ANONYMISÉ) ==========

  @Get("employees/:id")
  @Perms(Perm.METRICS_EMPLOYEE_USAGE_READ)
  @ApiOperation({
    summary: "Compteurs employé (RH)",
    description: "Retourne nb consultations + durée totale SANS contenu médical",
  })
  getEmployeeMetrics(
    @CurrentUser() user: any,
    @Param("id") employeeId: string,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.metricsService.getEmployeeMetrics(employeeId, from, to);
  }

  // ========== RH : Vue entreprise ==========

  @Get("companies/:id")
  @Perms(Perm.METRICS_COMPANY_READ)
  @ApiOperation({
    summary: "Compteurs entreprise (RH)",
    description: "Vue globale usage entreprise",
  })
  getCompanyMetrics(
    @CurrentUser() user: any,
    @Param("id") companyId: string,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.metricsService.getCompanyMetrics(companyId, from, to);
  }

  @Get("companies/:id/export")
  @Perms(Perm.EXPORTS_METRICS_COMPANY)
  @ApiOperation({ summary: "Export CSV usage entreprise" })
  exportCompanyMetrics(
    @CurrentUser() user: any,
    @Param("id") companyId: string,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.metricsService.exportCompanyCSV(companyId, from, to);
  }
}
```

---

### **6.2 Metrics Service**

**Fichier** : `apps/api/src/modules/metrics/metrics.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  /**
   * PRATICIEN : Compteurs (paiement)
   */
  async getPractitionerMetrics(
    practitionerId: string,
    from: string,
    to: string,
  ) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        practitioner_id,
        SUM(consult_count) AS consultations,
        SUM(total_duration_seconds) AS total_seconds,
        COUNT(DISTINCT day) AS active_days
      FROM practitioner_activity_daily
      WHERE practitioner_id = ${practitionerId}::uuid
        AND day BETWEEN ${from}::date AND ${to}::date
      GROUP BY practitioner_id
    `;

    if (result.length === 0) {
      return {
        practitionerId,
        period: { from, to },
        consultations: 0,
        totalDurationSeconds: 0,
        totalDurationMinutes: 0,
        averageDurationMinutes: 0,
        activeDays: 0,
      };
    }

    const data = result[0];
    const totalMinutes = Math.floor(Number(data.total_seconds) / 60);
    const avgMinutes =
      data.consultations > 0
        ? Math.floor(totalMinutes / Number(data.consultations))
        : 0;

    return {
      practitionerId,
      period: { from, to },
      consultations: Number(data.consultations),
      totalDurationSeconds: Number(data.total_seconds),
      totalDurationMinutes: totalMinutes,
      averageDurationMinutes: avgMinutes,
      activeDays: Number(data.active_days),
    };
  }

  /**
   * EMPLOYÉ : Compteurs (RH - ANONYMISÉ)
   */
  async getEmployeeMetrics(
    employeeId: string,
    from: string,
    to: string,
  ) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        employee_id,
        SUM(consult_count) AS consultations,
        SUM(total_duration_seconds) AS total_seconds
      FROM employee_activity_daily
      WHERE employee_id = ${employeeId}::uuid
        AND day BETWEEN ${from}::date AND ${to}::date
      GROUP BY employee_id
    `;

    if (result.length === 0) {
      return {
        employeeId,
        period: { from, to },
        consultations: 0,
        totalDurationSeconds: 0,
        totalDurationMinutes: 0,
      };
    }

    const data = result[0];
    const totalMinutes = Math.floor(Number(data.total_seconds) / 60);

    return {
      employeeId,
      period: { from, to },
      consultations: Number(data.consultations),
      totalDurationSeconds: Number(data.total_seconds),
      totalDurationMinutes: totalMinutes,
      // ❌ PAS DE : practitioner, specialty, content
    };
  }

  /**
   * ENTREPRISE : Compteurs (RH)
   */
  async getCompanyMetrics(
    companyId: string,
    from: string,
    to: string,
  ) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        company_id,
        SUM(consult_count) AS consultations,
        SUM(total_duration_seconds) AS total_seconds,
        AVG(active_users_count) AS avg_active_users
      FROM company_activity_daily
      WHERE company_id = ${companyId}::uuid
        AND day BETWEEN ${from}::date AND ${to}::date
      GROUP BY company_id
    `;

    if (result.length === 0) {
      return {
        companyId,
        period: { from, to },
        consultations: 0,
        totalDurationSeconds: 0,
        totalDurationHours: 0,
        avgActiveUsers: 0,
      };
    }

    const data = result[0];
    const totalHours = Math.floor(Number(data.total_seconds) / 3600);

    return {
      companyId,
      period: { from, to },
      consultations: Number(data.consultations),
      totalDurationSeconds: Number(data.total_seconds),
      totalDurationHours: totalHours,
      avgActiveUsers: Math.round(Number(data.avg_active_users)),
    };
  }

  /**
   * EXPORT CSV (Praticien)
   */
  async exportPractitionerCSV(
    practitionerId: string,
    from: string,
    to: string,
  ): Promise<string> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        day,
        consult_count,
        total_duration_seconds
      FROM practitioner_activity_daily
      WHERE practitioner_id = ${practitionerId}::uuid
        AND day BETWEEN ${from}::date AND ${to}::date
      ORDER BY day ASC
    `;

    let csv = "Date,Consultations,Durée (minutes)\n";
    let totalConsults = 0;
    let totalSeconds = 0;

    for (const row of rows) {
      const minutes = Math.floor(Number(row.total_duration_seconds) / 60);
      csv += `${row.day.toISOString().split("T")[0]},${row.consult_count},${minutes}\n`;
      totalConsults += Number(row.consult_count);
      totalSeconds += Number(row.total_duration_seconds);
    }

    csv += `\nTOTAL,${totalConsults},${Math.floor(totalSeconds / 60)}`;

    return csv;
  }

  /**
   * EXPORT CSV (Entreprise)
   */
  async exportCompanyCSV(
    companyId: string,
    from: string,
    to: string,
  ): Promise<string> {
    // TODO: Implémenter
    return "CSV export not implemented";
  }
}
```

---

## 7. CHAT GATEWAY (WEBSOCKET)

**Fichier** : `apps/api/src/modules/chat/chat.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "../../common/guards/ws-jwt.guard";
import { ChatService } from "./chat.service";

@WebSocketGateway(3001, {
  cors: { origin: "*" },
  namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    // TODO: Authentifier via JWT
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("chat:join")
  @UseGuards(WsJwtGuard)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { consultationId: string },
  ) {
    client.join(`consultation:${data.consultationId}`);

    // Envoyer historique
    const messages = await this.chatService.getMessages(data.consultationId);
    client.emit("chat:history", messages);
  }

  @SubscribeMessage("chat:message")
  @UseGuards(WsJwtGuard)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      consultationId: string;
      content: string;
      senderId: string;
    },
  ) {
    // Sauvegarder message (chiffré)
    const message = await this.chatService.saveMessage(data);

    // Broadcast à la room
    this.server
      .to(`consultation:${data.consultationId}`)
      .emit("chat:message:received", message);
  }

  @SubscribeMessage("chat:typing")
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { consultationId: string; isTyping: boolean },
  ) {
    client
      .to(`consultation:${data.consultationId}`)
      .emit("chat:typing", data);
  }
}
```

---

## 8. SERVICES TECHNIQUES

### **8.1 Encryption Service (AES-256-GCM)**

**Fichier** : `apps/api/src/security/encryption.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

@Injectable()
export class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly key: Buffer;

  constructor() {
    // Clé depuis variable d'environnement (32 bytes = 64 hex chars)
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex || keyHex.length !== 64) {
      throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
    }
    this.key = Buffer.from(keyHex, "hex");
  }

  /**
   * Chiffrer un texte
   */
  encrypt(text: string): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return { encrypted, iv, authTag };
  }

  /**
   * Déchiffrer un texte
   */
  decrypt(encrypted: Buffer, iv: Buffer, authTag: Buffer): string {
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}
```

---

**FIN DU FICHIER 06 - Backend NestJS Code Complet**

**Voulez-vous que je continue avec :**
- 07 : Frontend Next.js (code complet)
- 08 : SQL complet avec triggers
- 09 : OpenAPI/Swagger complet
