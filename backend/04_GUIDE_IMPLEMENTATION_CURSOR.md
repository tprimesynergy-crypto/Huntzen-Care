# 🚀 GUIDE D'IMPLÉMENTATION CURSOR - HUNTZEN CARE BACKEND

## 📋 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

Ce guide est conçu pour être donné **étape par étape à Cursor** pour développer le backend complet.

---

## 🏗️ PHASE 0 : SETUP INITIAL (1 jour)

### **Étape 0.1 : Initialiser le projet NestJS**

```bash
# Créer projet
npm i -g @nestjs/cli
nest new huntzen-care-backend
cd huntzen-care-backend

# Installer dépendances principales
npm install @prisma/client prisma
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install redis ioredis @nestjs/bull bull
npm install nodemailer @nestjs-modules/mailer
npm install helmet compression
npm install uuid date-fns

# Dev dependencies
npm install -D @types/node @types/bcrypt @types/passport-jwt
npm install -D @types/multer @types/nodemailer
npm install -D prettier eslint
```

### **Étape 0.2 : Configurer Prisma**

```bash
npx prisma init
```

**Copier le contenu de** `/backend/02_SCHEMA_DATABASE_COMPLET.md` dans `prisma/schema.prisma`

```bash
# Générer client
npx prisma generate

# Créer migration initiale
npx prisma migrate dev --name init

# Créer seed
# Copier le code seed du document 02
npx prisma db seed
```

### **Étape 0.3 : Structure du projet**

```bash
mkdir -p src/modules/{auth,companies,employees,practitioners,consultations,chat,clinical-notes,journal,reports,blog,news,notifications,files}
mkdir -p src/gateways
mkdir -p src/services
mkdir -p src/middlewares
mkdir -p src/guards
mkdir -p src/decorators
mkdir -p src/common/{filters,interceptors,pipes}
```

### **Étape 0.4 : Variables d'environnement**

**Créer `.env`** :
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/huntzen_care?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption (générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY="64_hex_characters_here"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Jitsi
JITSI_DOMAIN="meet.huntzen.care"
JITSI_APP_ID="huntzen_app"
JITSI_SECRET="your-jitsi-secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@huntzen.care"
SMTP_PASSWORD="your-smtp-password"
EMAIL_FROM="HuntZen Care <noreply@huntzen.care>"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# API
PORT=3000
NODE_ENV="development"

# File upload
MAX_FILE_SIZE=10485760 # 10MB
UPLOAD_PATH="./uploads"
```

---

## 🔐 PHASE 1 : AUTHENTIFICATION (2 jours)

### **Étape 1.1 : Service Prisma global**

**Demande à Cursor** :
> Crée un service Prisma global dans `src/services/prisma.service.ts` qui :
> - Étend `PrismaClient`
> - Implémente `onModuleInit` et `onModuleDestroy`
> - Gère la connexion/déconnexion
> - Ajoute un middleware pour le multi-tenant (RLS simulation)

**Code attendu** :
```typescript
// src/services/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

---

### **Étape 1.2 : Service de chiffrement**

**Demande à Cursor** :
> Crée `src/services/encryption.service.ts` qui implémente :
> - `encrypt(text: string)` : retourne `{ encrypted, iv, authTag }`
> - `decrypt(encrypted: string, iv: string, authTag?: string)` : retourne texte clair
> - Utilise AES-256-GCM
> - Clé depuis `process.env.ENCRYPTION_KEY`

**Code attendu** : (voir document 01, section Chiffrement)

---

### **Étape 1.3 : Module Auth - Register**

**Demande à Cursor** :
> Crée le module d'authentification dans `src/modules/auth/` avec :
> 
> **Fichiers** :
> - `auth.module.ts`
> - `auth.controller.ts`
> - `auth.service.ts`
> - `dto/register.dto.ts`
> - `dto/login.dto.ts`
> 
> **Register DTO** :
> ```typescript
> export class RegisterDto {
>   @IsEmail()
>   email: string;
> 
>   @IsString()
>   @MinLength(8)
>   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
>   password: string;
> 
>   @IsOptional()
>   @IsString()
>   invitationToken?: string;
> }
> ```
> 
> **AuthService.register()** :
> - Vérifie email unique
> - Hash password (bcrypt, rounds: 10)
> - Crée User (status: inactif, emailVerified: false)
> - Génère token vérification email
> - Envoie email (via EmailService placeholder pour l'instant)
> - Retourne user sans le passwordHash

**Tests à implémenter** :
- Email déjà existant → throw ConflictException
- Mot de passe faible → throw BadRequestException (validation DTO)
- Invitation token invalide → throw NotFoundException

---

### **Étape 1.4 : Module Auth - Login & JWT**

**Demande à Cursor** :
> Ajoute la méthode `login()` à AuthService et configure JWT :
> 
> **Installation JWT** :
> ```bash
> npm install @nestjs/jwt passport-jwt
> ```
> 
> **AuthModule imports** :
> ```typescript
> JwtModule.register({
>   secret: process.env.JWT_SECRET,
>   signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
> })
> ```
> 
> **AuthService.login()** :
> - Vérifie email existe
> - Vérifie compte actif + email vérifié
> - Vérifie mot de passe (bcrypt.compare)
> - Génère accessToken (JWT payload: { sub: userId, email, role, companyId })
> - Génère refreshToken (JWT avec secret différent)
> - Stocke refreshToken en BDD (hasheté)
> - Met à jour `lastLoginAt`
> - Crée audit log (action: LOGIN)
> - Retourne { accessToken, refreshToken, user }
> 
> **JWT Strategy** :
> Crée `strategies/jwt.strategy.ts` qui :
> - Étend `PassportStrategy(Strategy)`
> - Extrait token du header Authorization
> - Valide et retourne user depuis payload

---

### **Étape 1.5 : Guards & Decorators**

**Demande à Cursor** :
> Crée les guards et decorators pour protéger les routes :
> 
> **1. JWT Auth Guard** (`guards/jwt-auth.guard.ts`) :
> ```typescript
> @Injectable()
> export class JwtAuthGuard extends AuthGuard('jwt') {}
> ```
> 
> **2. Roles Guard** (`guards/roles.guard.ts`) :
> - Lit les rôles requis depuis decorator `@Roles()`
> - Vérifie que `request.user.role` match
> - Throw UnauthorizedException si non autorisé
> 
> **3. Roles Decorator** (`decorators/roles.decorator.ts`) :
> ```typescript
> export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
> ```
> 
> **4. Current User Decorator** (`decorators/current-user.decorator.ts`) :
> ```typescript
> export const CurrentUser = createParamDecorator(
>   (data: unknown, ctx: ExecutionContext) => {
>     const request = ctx.switchToHttp().getRequest();
>     return request.user;
>   },
> );
> ```

---

### **Étape 1.6 : Refresh Token & Logout**

**Demande à Cursor** :
> Ajoute les méthodes suivantes à AuthService :
> 
> **refresh(refreshToken: string)** :
> - Vérifie token valide (JWT verify avec REFRESH_SECRET)
> - Vérifie token existe en BDD et non expiré
> - Génère nouveau accessToken
> - **Rotation** : génère nouveau refreshToken, invalide l'ancien
> - Retourne { accessToken, refreshToken }
> 
> **logout(userId: string, refreshToken: string)** :
> - Supprime refreshToken de BDD
> - Crée audit log (action: LOGOUT)
> - Retourne succès

---

### **Étape 1.7 : Reset password**

**Demande à Cursor** :
> Ajoute forgot-password et reset-password :
> 
> **forgotPassword(email: string)** :
> - Vérifie email existe
> - Génère token unique (uuid + expires 1h)
> - Stocke token en table temporaire
> - Envoie email avec lien
> - Retourne message générique (même si email inexistant, sécurité)
> 
> **resetPassword(token: string, newPassword: string)** :
> - Vérifie token valide et non expiré
> - Hash nouveau password
> - Met à jour User
> - Invalide tous refreshTokens (sécurité)
> - Supprime token reset
> - Envoie email confirmation
> - Retourne succès

---

## 🏢 PHASE 2 : ENTREPRISES & EMPLOYÉS (2 jours)

### **Étape 2.1 : Module Companies**

**Demande à Cursor** :
> Crée le module Companies (`src/modules/companies/`) avec :
> 
> **Endpoints** :
> - `POST /companies` (ADMIN_HUNTZEN) : Créer entreprise
> - `GET /companies` (ADMIN_HUNTZEN) : Liste entreprises
> - `GET /companies/:id` (ADMIN_HUNTZEN, ADMIN_RH own company)
> - `PUT /companies/:id` (ADMIN_HUNTZEN, ADMIN_RH own company)
> - `PUT /companies/:id/validate` (ADMIN_HUNTZEN) : Valider entreprise
> - `GET /companies/me` (ADMIN_RH) : Ma entreprise
> 
> **CompaniesService** :
> - `create(createDto)` : Génère slug unique, crée entreprise (isActive: false)
> - `validate(id, adminId)` : Set isActive=true, validatedAt, validatedBy
> - `update(id, updateDto)` : Mise à jour infos
> - `findOne(id)` : Avec vérification accès (RH peut voir que sa company)
> 
> **DTOs** :
> - CreateCompanyDto : name, legalName, siret, emailDomains[], sector, size, etc.
> - UpdateCompanyDto : Partial de CreateCompanyDto

---

### **Étape 2.2 : Module Employees**

**Demande à Cursor** :
> Crée le module Employees (`src/modules/employees/`) avec :
> 
> **Endpoints** :
> - `POST /employees` (ADMIN_RH) : Créer employé
> - `POST /employees/import` (ADMIN_RH) : Import CSV
> - `GET /employees` (ADMIN_RH) : Liste employés + stats
> - `GET /employees/:id` (ADMIN_RH, EMPLOYEE self)
> - `PUT /employees/:id` (ADMIN_RH, EMPLOYEE self)
> - `PUT /employees/:id/activate` (ADMIN_RH)
> - `POST /employees/activate` (PUBLIC) : Activation via token
> - `GET /employees/me` (EMPLOYEE)
> - `PUT /employees/me` (EMPLOYEE)
> 
> **EmployeesService** :
> - `create(companyId, createDto)` :
>   - Vérifie email domaine autorisé
>   - Crée User + Employee
>   - Génère token invitation (expires 7j)
>   - Envoie email invitation
> - `importCSV(companyId, file)` :
>   - Parse CSV (colonnes: email, firstName, lastName, department, position)
>   - Valide chaque ligne
>   - Crée employés en batch
>   - Retourne rapport (succès, échecs, erreurs)
> - `activate(token, password)` :
>   - Vérifie token valide
>   - Set password + isActive + emailVerified
>   - Crée audit log
> - `findByCompany(companyId, filters)` :
>   - Retourne employés + stats consultations (jointure avec vue matérialisée)
> 
> **DTOs** :
> - CreateEmployeeDto
> - UpdateEmployeeDto
> - ActivateEmployeeDto
> - ImportEmployeeDto (pour CSV)

---

## 👨‍⚕️ PHASE 3 : PRATICIENS & DISPONIBILITÉS (2 jours)

### **Étape 3.1 : Module Practitioners**

**Demande à Cursor** :
> Crée le module Practitioners avec :
> 
> **Endpoints** :
> - `POST /practitioners` (ADMIN_HUNTZEN) : Créer praticien
> - `GET /practitioners` (ADMIN_HUNTZEN)
> - `GET /practitioners/pending` (ADMIN_HUNTZEN) : Liste en attente validation
> - `PUT /practitioners/:id/validate` (ADMIN_HUNTZEN)
> - `GET /practitioners/me` (PRACTITIONER)
> - `PUT /practitioners/me` (PRACTITIONER)
> - `GET /practitioners/search` (EMPLOYEE, PUBLIC) : Recherche avec filtres
> - `GET /practitioners/:id` (EMPLOYEE, PUBLIC)
> 
> **PractitionersService** :
> - `create(createDto)` : Crée User + Practitioner (isValidated: false)
> - `validate(id, adminId)` : Set isValidated=true, validatedAt, documentsVerified
> - `search(filters)` :
>   - Filtres: specialty, languages[], offersVideo, offersPhone, acceptingNewClients
>   - Tri: rating, experience, availability
>   - Pagination
>   - Retourne liste avec avgRating et reviewCount
> - `findOne(id)` : Profil complet + avis publiés
> 
> **DTOs** :
> - CreatePractitionerDto
> - UpdatePractitionerDto
> - SearchPractitionersDto
> - ValidatePractitionerDto

---

### **Étape 3.2 : Module Availability**

**Demande à Cursor** :
> Crée le module Availability dans `src/modules/practitioners/availability/` :
> 
> **Endpoints** :
> - `POST /availability` (PRACTITIONER) : Créer dispo récurrente
> - `GET /availability` (PRACTITIONER) : Mes dispos
> - `PUT /availability/:id` (PRACTITIONER)
> - `DELETE /availability/:id` (PRACTITIONER)
> - `POST /availability/exception` (PRACTITIONER) : Ajouter exception (congé)
> - `GET /availability/slots` (EMPLOYEE, PRACTITIONER) : Générer slots disponibles
> 
> **AvailabilityService** :
> - `create(practitionerId, createDto)` : Crée récurrence ou exception
> - `generateSlots(practitionerId, startDate, endDate)` :
>   - Calcule tous les créneaux possibles (récurrences + durée)
>   - Filtre les exceptions (congés)
>   - Filtre les créneaux déjà réservés (jointure consultations)
>   - Retourne array de { startTime, endTime, available: boolean }
> 
> **DTOs** :
> - CreateAvailabilityDto
> - CreateExceptionDto
> - GenerateSlotsDto (startDate, endDate)

---

## 📅 PHASE 4 : CONSULTATIONS (3 jours)

### **Étape 4.1 : Module Consultations - Booking**

**Demande à Cursor** :
> Crée le module Consultations avec système de réservation :
> 
> **Endpoints** :
> - `POST /consultations` (EMPLOYEE) : Réserver
> - `GET /consultations/mine` (EMPLOYEE) : Mes consultations
> - `GET /consultations/upcoming` (PRACTITIONER) : À venir
> - `GET /consultations/history` (PRACTITIONER, EMPLOYEE)
> - `GET /consultations/:id` (participant)
> - `PUT /consultations/:id/confirm` (PRACTITIONER)
> - `PUT /consultations/:id/cancel` (EMPLOYEE, PRACTITIONER)
> 
> **ConsultationsService** :
> - `create(employeeId, createDto)` :
>   - Vérifie slot disponible (pas déjà réservé)
>   - Vérifie dans horaires praticien
>   - Crée consultation (status: SCHEDULED)
>   - Génère roomName (si vidéo): `huntzen-{id}-{timestamp}`
>   - Crée événement SCHEDULED
>   - Envoie notifications (email + in-app) aux deux parties
>   - Retourne consultation
> - `confirm(id, practitionerId)` :
>   - Vérifie praticien autorisé
>   - Set status = CONFIRMED
>   - Crée événement CONFIRMED
>   - Envoie notification employé
> - `cancel(id, userId, reason)` :
>   - Set status = CANCELLED, cancelledAt, cancelledBy, cancelReason
>   - Crée événement CANCELLED
>   - Envoie notifications
> 
> **DTOs** :
> - CreateConsultationDto
> - CancelConsultationDto

---

### **Étape 4.2 : Jitsi Service & Room Access**

**Demande à Cursor** :
> Crée JitsiService dans `src/services/jitsi.service.ts` :
> 
> **Méthodes** :
> - `generateToken(options: { room, userId, userName, moderator, expiresIn })` :
>   - Génère JWT Jitsi avec payload conforme
>   - Utilise JITSI_SECRET, JITSI_APP_ID, JITSI_DOMAIN depuis env
>   - Retourne token string
> 
> **Endpoint dans Consultations** :
> - `GET /consultations/:id/room` (EMPLOYEE, PRACTITIONER participant) :
>   - Vérifie consultation exists et user autorisé
>   - Génère JWT Jitsi (praticien = moderator)
>   - Crée événement ROOM_JOINED
>   - Retourne { roomName, jwt, domain }
> 
> **Code JWT Jitsi** : (voir document 01, section Jitsi)

---

### **Étape 4.3 : Start/End Consultation & Events**

**Demande à Cursor** :
> Ajoute méthodes de gestion du lifecycle :
> 
> **ConsultationsService** :
> - `start(id, practitionerId)` :
>   - Vérifie praticien autorisé
>   - Set status = IN_PROGRESS, startedAt = now()
>   - Crée événement STARTED
>   - Retourne consultation
> - `end(id, practitionerId)` :
>   - Vérifie praticien autorisé
>   - Set status = COMPLETED, endedAt = now()
>   - Trigger DB calcule actualDuration automatiquement
>   - Set billingStatus = VALIDATED (compte dans compteurs)
>   - Crée événement ENDED
>   - Envoie CTA post-consultation (notes, feedback, rebooking)
>   - Retourne consultation avec actualDuration
> - `markNoShow(id, userId)` :
>   - Set status = NO_SHOW, noShowAt, noShowBy
>   - Crée événement NO_SHOW
> 
> **Endpoints** :
> - `PUT /consultations/:id/start` (PRACTITIONER)
> - `PUT /consultations/:id/end` (PRACTITIONER)
> - `POST /consultations/:id/no-show` (PRACTITIONER)

---

## 💬 PHASE 5 : CHAT TEMPS RÉEL (2 jours)

### **Étape 5.1 : Chat Gateway (WebSocket)**

**Demande à Cursor** :
> Crée ChatGateway dans `src/gateways/chat.gateway.ts` :
> 
> **Configuration** :
> ```typescript
> @WebSocketGateway(3001, {
>   cors: { origin: '*' },
>   namespace: '/chat',
> })
> ```
> 
> **Événements à gérer** :
> - `chat:join` : Joindre room consultation
> - `chat:leave` : Quitter room
> - `chat:message` : Envoyer message
> - `chat:typing` : Indicateur frappe
> - `chat:read` : Marquer lu
> 
> **Authentification Socket** :
> - Extraire token depuis `client.handshake.auth.token`
> - Valider JWT
> - Stocker userId dans `client.data`
> 
> **Handlers** : (code complet dans document 01, section Chat)

---

### **Étape 5.2 : Chat Service & Encryption**

**Demande à Cursor** :
> Crée ChatService dans `src/modules/chat/chat.service.ts` :
> 
> **Méthodes** :
> - `hasAccess(consultationId, userId)` : Vérifie participant
> - `getMessages(consultationId)` :
>   - Récupère messages triés par createdAt
>   - Déchiffre contenu avec EncryptionService
>   - Retourne array
> - `saveMessage(data)` :
>   - Chiffre contenu (AES-256-GCM)
>   - Sauvegarde en BDD (encryptedContent, iv, authTag)
>   - Retourne message déchiffré pour broadcast
> - `markAsRead(messageId, userId)` :
>   - Set isRead=true, readAt=now()
> 
> **REST Endpoints (fallback)** :
> - `GET /chat/:consultationId/messages`
> - `POST /chat/:consultationId/messages`
> - `PUT /chat/messages/:id/read`

---

### **Étape 5.3 : Audio Call Gateway (WebRTC Signaling)**

**Demande à Cursor** :
> Crée AudioCallGateway dans `src/gateways/audio-call.gateway.ts` :
> 
> **Configuration** :
> ```typescript
> @WebSocketGateway(3001, {
>   cors: { origin: '*' },
>   namespace: '/audio-call',
> })
> ```
> 
> **Événements** :
> - `call:initiate` : Démarrer appel
> - `call:accept` : Accepter appel
> - `call:reject` : Refuser appel
> - `call:end` : Terminer appel
> - `webrtc:offer` : SDP offer
> - `webrtc:answer` : SDP answer
> - `webrtc:ice-candidate` : ICE candidate
> 
> **Logique** : (code complet dans document 01, section Audio)

---

## 📝 PHASE 6 : NOTES & JOURNAL (1 jour)

### **Étape 6.1 : Module Clinical Notes**

**Demande à Cursor** :
> Crée module ClinicalNotes avec chiffrement E2E :
> 
> **Endpoints** :
> - `POST /clinical-notes` (PRACTITIONER)
> - `GET /clinical-notes/consultation/:consultationId` (PRACTITIONER author only)
> - `PUT /clinical-notes/:id` (PRACTITIONER author only)
> - `DELETE /clinical-notes/:id` (PRACTITIONER author only)
> 
> **ClinicalNotesService** :
> - `create(practitionerId, createDto)` :
>   - Chiffre content avec EncryptionService
>   - Sauvegarde (encryptedContent, iv, authTag)
>   - Crée audit log (sans contenu)
> - `findByConsultation(consultationId, practitionerId)` :
>   - Vérifie author match
>   - Déchiffre notes
>   - Retourne array
> - `update(id, practitionerId, updateDto)` :
>   - Vérifie author match
>   - Chiffre nouveau contenu
>   - Update
> 
> **Guard** : Créer `PractitionerAuthorGuard` qui vérifie que le praticien est l'auteur

---

### **Étape 6.2 : Module Journal**

**Demande à Cursor** :
> Crée module Journal (employé uniquement) :
> 
> **Endpoints** :
> - `POST /journal` (EMPLOYEE)
> - `GET /journal` (EMPLOYEE)
> - `GET /journal/:id` (EMPLOYEE owner)
> - `PUT /journal/:id` (EMPLOYEE owner)
> - `DELETE /journal/:id` (EMPLOYEE owner)
> 
> **JournalService** :
> - `create(employeeId, createDto)` : Chiffre + sauvegarde
> - `findByEmployee(employeeId, filters)` : Déchiffre + retourne
> - `update(id, employeeId, updateDto)` : Vérifie owner + chiffre + update
> - `delete(id, employeeId)` : Vérifie owner + supprime
> 
> **DTOs** :
> - CreateJournalEntryDto : { content, mood?, tags[] }
> - UpdateJournalEntryDto

---

## 📊 PHASE 7 : COMPTEURS & EXPORTS (2 jours)

### **Étape 7.1 : Module Reports - Practitioner Stats**

**Demande à Cursor** :
> Crée ReportsModule dans `src/modules/reports/` :
> 
> **Endpoints** :
> - `GET /reports/practitioner-stats` (PRACTITIONER)
> - `GET /reports/practitioner-billing` (PRACTITIONER)
> - `GET /reports/practitioner-export-csv` (PRACTITIONER)
> 
> **ReportsService** :
> - `getPractitionerStats(practitionerId, period)` :
>   - Requête sur vue matérialisée `practitioner_billing_stats`
>   - Filtre par period (format: YYYY-MM)
>   - Agrège : consultationCount, totalDurationMinutes, avgDuration
>   - Group by company si multi-tenant
>   - Retourne stats
> - `exportPractitionerBilling(practitionerId, period, format)` :
>   - Requête détaillée consultations COMPLETED + VALIDATED
>   - Colonnes : date, company, duration, status
>   - **PAS DE** : employeeName, reason, notes
>   - Génère CSV avec headers
>   - Retourne stream
> 
> **CSV Format** :
> ```
> # RAPPORT FACTURATION PRATICIEN
> # Période: 2025-01
> # Praticien: Dr. Sophie Martin
> # Généré le: 2025-02-01
> 
> Date,Entreprise,Durée (min),Statut
> 2025-01-05,TechCorp France,50,COMPLETED
> 2025-01-07,TechCorp France,52,COMPLETED
> ...
> 
> TOTAL,87 consultations,4350 minutes
> ```

---

### **Étape 7.2 : Module Reports - Employee Usage**

**Demande à Cursor** :
> Ajoute endpoints RH pour compteurs employés :
> 
> **Endpoints** :
> - `GET /reports/employee-usage` (ADMIN_RH) : Stats par employé
> - `GET /reports/employee-usage/:employeeId` (ADMIN_RH) : Détail employé
> - `GET /reports/export-employee-usage` (ADMIN_RH) : Export CSV
> 
> **ReportsService** :
> - `getEmployeeUsage(companyId, filters)` :
>   - Requête sur vue `employee_usage_stats`
>   - Filtre par companyId (RLS), department?, period?
>   - Retourne array avec : employeeName, department, consultationCount, totalDuration
>   - **JAMAIS** : practitioner, specialty, exactDates, content
> - `exportEmployeeUsage(companyId, period, format)` :
>   - Génère CSV avec notice RGPD
>   - Colonnes: Employé, Département, Consultations, Durée (min)
>   - Crée audit log (action: EXPORT)
> 
> **CSV Format** :
> ```
> # RAPPORT UTILISATION EMPLOYÉS - ANONYMISÉ
> # Conformité RGPD : Données agrégées uniquement, seuil min. 10 employés
> # Période: 2025-01
> # Entreprise: TechCorp France
> # Généré le: 2025-02-01
> 
> Employé,Département,Consultations,Durée (min)
> Marc Dupont,Développement,4,200
> Claire Laurent,Marketing,3,150
> ...
> ```

---

### **Étape 7.3 : Refresh vues matérialisées (CRON)**

**Demande à Cursor** :
> Crée un service CRON pour rafraîchir les vues :
> 
> **Installation** :
> ```bash
> npm install @nestjs/schedule
> ```
> 
> **ScheduleModule** dans AppModule :
> ```typescript
> @Module({
>   imports: [ScheduleModule.forRoot(), ...]
> })
> ```
> 
> **CronService** (`src/services/cron.service.ts`) :
> ```typescript
> @Injectable()
> export class CronService {
>   constructor(private prisma: PrismaService) {}
> 
>   @Cron('0 */6 * * *') // Toutes les 6h
>   async refreshMaterializedViews() {
>     await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY employee_usage_stats`;
>     await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY practitioner_billing_stats`;
>   }
> }
> ```

---

## 📰 PHASE 8 : BLOG & NEWS (1 jour)

### **Étape 8.1 : Module Blog (Articles)**

**Demande à Cursor** :
> Crée module Blog dans `src/modules/blog/` :
> 
> **Endpoints** :
> - `POST /articles` (ADMIN_HUNTZEN)
> - `GET /articles` (PUBLIC)
> - `GET /articles/:slug` (PUBLIC)
> - `PUT /articles/:id` (ADMIN_HUNTZEN)
> - `DELETE /articles/:id` (ADMIN_HUNTZEN)
> - `POST /articles/:id/publish` (ADMIN_HUNTZEN)
> - `PUT /articles/:slug/view` (PUBLIC) : Incrémenter viewCount
> 
> **BlogService** :
> - `create(authorId, createDto)` : Créer article (status: DRAFT)
> - `publish(id)` : Set status=PUBLISHED, publishedAt=now()
> - `findAll(filters)` :
>   - Filtre: status, category, tags
>   - Tri: publishedAt DESC
>   - Pagination
> - `findBySlug(slug)` : Retourne article + increment viewCount
> 
> **DTOs** :
> - CreateArticleDto
> - UpdateArticleDto

---

### **Étape 8.2 : Module News (Internes entreprise)**

**Demande à Cursor** :
> Crée module News dans `src/modules/news/` :
> 
> **Endpoints** :
> - `POST /news` (ADMIN_RH)
> - `GET /news` (ADMIN_RH) : Mes news
> - `GET /news/company` (EMPLOYEE) : News de mon entreprise
> - `PUT /news/:id` (ADMIN_RH)
> - `DELETE /news/:id` (ADMIN_RH)
> 
> **NewsService** :
> - `create(companyId, authorId, createDto)` : Créer news
> - `findByCompany(companyId, filters)` :
>   - Filtre par targetDepartments (si vide = tous)
>   - Tri: publishedAt DESC
> 
> **DTOs** :
> - CreateNewsDto
> - UpdateNewsDto

---

## 🔔 PHASE 9 : NOTIFICATIONS (1 jour)

### **Étape 9.1 : Module Notifications**

**Demande à Cursor** :
> Crée module Notifications dans `src/modules/notifications/` :
> 
> **Endpoints** :
> - `GET /notifications` (ALL)
> - `PUT /notifications/:id/read` (ALL)
> - `PUT /notifications/read-all` (ALL)
> - `DELETE /notifications/:id` (ALL)
> 
> **NotificationsService** :
> - `create(userId, createDto)` : Créer notification
> - `findByUser(userId, filters)` : Liste avec unread count
> - `markAsRead(id, userId)` : Set isRead, readAt
> - `markAllAsRead(userId)` : Bulk update
> 
> **NotificationGateway** (WebSocket) :
> - Événement `notification:new` broadcasté au userId
> - Le client incrémente badge + affiche toast
> 
> **Types de notifications** : (voir enum dans schema)

---

### **Étape 9.2 : Email Service**

**Demande à Cursor** :
> Crée EmailService dans `src/services/email.service.ts` :
> 
> **Installation** :
> ```bash
> npm install @nestjs-modules/mailer nodemailer
> npm install @nestjs-modules/mailer handlebars
> ```
> 
> **Configuration** :
> ```typescript
> MailerModule.forRoot({
>   transport: {
>     host: process.env.SMTP_HOST,
>     port: process.env.SMTP_PORT,
>     auth: {
>       user: process.env.SMTP_USER,
>       pass: process.env.SMTP_PASSWORD,
>     },
>   },
>   defaults: {
>     from: process.env.EMAIL_FROM,
>   },
>   template: {
>     dir: __dirname + '/templates',
>     adapter: new HandlebarsAdapter(),
>     options: {
>       strict: true,
>     },
>   },
> })
> ```
> 
> **Méthodes** :
> - `sendConsultationConfirmed(to, data)`
> - `sendConsultationCancelled(to, data)`
> - `sendConsultationReminder(to, data)`
> - `sendInvitation(to, token)`
> - `sendPasswordReset(to, token)`
> 
> **Templates** : Créer templates Handlebars dans `src/templates/`

---

## 📂 PHASE 10 : UPLOAD FICHIERS (1 jour)

### **Étape 10.1 : Module Files**

**Demande à Cursor** :
> Crée module Files dans `src/modules/files/` pour uploads :
> 
> **Installation** :
> ```bash
> npm install @nestjs/platform-express multer
> ```
> 
> **Endpoints** :
> - `POST /files/upload` (ALL) : Upload fichier
> - `GET /files/:id` (ALL) : Télécharger fichier (avec vérif accès)
> - `DELETE /files/:id` (ALL) : Supprimer fichier (owner only)
> 
> **FilesService** :
> - `upload(file, userId, fileType, relatedResource?, relatedId?)` :
>   - Valide taille (max 10MB)
>   - Valide type MIME
>   - Génère nom unique (uuid + extension)
>   - Sauvegarde sur disque (`./uploads/` ou MinIO)
>   - Chiffre si fileType sensible (DOCUMENT, CERTIFICATE)
>   - Crée entrée File en BDD
>   - Retourne { id, url }
> - `download(id, userId)` :
>   - Vérifie accès (uploadedBy ou allowedRoles)
>   - Déchiffre si nécessaire
>   - Stream fichier
> - `delete(id, userId)` :
>   - Vérifie owner
>   - Supprime fichier disque
>   - Supprime entrée BDD
> 
> **Multer Config** :
> ```typescript
> @UseInterceptors(
>   FileInterceptor('file', {
>     dest: './uploads',
>     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
>     fileFilter: (req, file, cb) => {
>       const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
>       if (allowedMimes.includes(file.mimetype)) {
>         cb(null, true);
>       } else {
>         cb(new BadRequestException('Type de fichier non autorisé'), false);
>       }
>     },
>   }),
> )
> ```

---

## 🔐 PHASE 11 : SÉCURITÉ & RGPD (2 jours)

### **Étape 11.1 : 2FA Setup**

**Demande à Cursor** :
> Ajoute 2FA au module Auth :
> 
> **Installation** :
> ```bash
> npm install speakeasy qrcode
> ```
> 
> **Endpoints** :
> - `POST /auth/2fa/setup` (ALL)
> - `POST /auth/2fa/verify` (ALL)
> - `POST /auth/2fa/disable` (ALL)
> 
> **AuthService** :
> - `setup2FA(userId)` :
>   - Génère secret (speakeasy)
>   - Génère QR code (qrcode)
>   - Génère backup codes (10 codes aléatoires)
>   - Retourne { secret, qrCodeUrl, backupCodes }
> - `verify2FA(userId, code)` :
>   - Vérifie code TOTP
>   - Active 2FA (twoFactorEnabled=true, store secret)
>   - Retourne succès
> - `disable2FA(userId, password, code)` :
>   - Vérifie password
>   - Vérifie code 2FA
>   - Désactive (twoFactorEnabled=false, clear secret)
> 
> **Modifier login()** :
> - Si twoFactorEnabled, exiger code 2FA supplémentaire

---

### **Étape 11.2 : RGPD - Export & Suppression**

**Demande à Cursor** :
> Ajoute endpoints RGPD au module Users :
> 
> **Endpoints** :
> - `GET /users/me/export` (ALL)
> - `POST /users/me/delete-request` (ALL)
> - `POST /users/me/delete-request/cancel` (ALL)
> 
> **UsersService** :
> - `exportUserData(userId)` :
>   - Récupère toutes données user : profil, consultations (sans notes cliniques), messages (déchiffrés), journal
>   - Génère JSON formaté
>   - Crée audit log (action: EXPORT)
>   - Retourne JSON file
> - `requestDeletion(userId, reason)` :
>   - Crée DeleteRequest (status: PENDING, deletionDate = now + 30 jours)
>   - Envoie email confirmation
>   - Retourne { cancellableUntil }
> - `processDeletion(userId)` (CRON daily) :
>   - Si deletionDate < now et status=PENDING :
>     - Anonymise consultations (employee remplacé par "Utilisateur supprimé")
>     - Supprime journal
>     - Anonymise messages
>     - Soft delete User (isActive=false, email="deleted-{uuid}@huntzen.care")
>     - Notes cliniques conservées (obligation légale)
>     - Crée audit log
> - `cancelDeletion(userId)` :
>   - Set DeleteRequest status=CANCELLED

---

### **Étape 11.3 : Rate Limiting & Helmet**

**Demande à Cursor** :
> Configure sécurité globale dans `main.ts` :
> 
> **Installation** :
> ```bash
> npm install @nestjs/throttler helmet compression
> ```
> 
> **Configuration** :
> ```typescript
> // main.ts
> import helmet from 'helmet';
> import compression from 'compression';
> 
> async function bootstrap() {
>   const app = await NestFactory.create(AppModule);
> 
>   // Security headers
>   app.use(helmet());
> 
>   // Compression
>   app.use(compression());
> 
>   // CORS
>   app.enableCors({
>     origin: process.env.FRONTEND_URL,
>     credentials: true,
>   });
> 
>   // Validation globale
>   app.useGlobalPipes(
>     new ValidationPipe({
>       whitelist: true,
>       forbidNonWhitelisted: true,
>       transform: true,
>     }),
>   );
> 
>   await app.listen(process.env.PORT || 3000);
> }
> ```
> 
> **ThrottlerModule** dans AppModule :
> ```typescript
> ThrottlerModule.forRoot({
>   ttl: 60, // 60 secondes
>   limit: 10, // 10 requêtes max
> }),
> ```
> 
> **Rate limit spécifique login** :
> ```typescript
> @Throttle(5, 900) // 5 tentatives / 15 min
> @Post('login')
> async login(@Body() loginDto: LoginDto) { ... }
> ```

---

## 🏥 PHASE 12 : MONITORING & ADMIN (1 jour)

### **Étape 12.1 : Health Check**

**Demande à Cursor** :
> Crée HealthModule dans `src/modules/health/` :
> 
> **Installation** :
> ```bash
> npm install @nestjs/terminus
> ```
> 
> **Endpoint** :
> - `GET /health` (PUBLIC) : Health check basique
> - `GET /super-admin/health` (SUPER_ADMIN) : Health check détaillé
> 
> **HealthController** :
> ```typescript
> @Get()
> @HealthCheck()
> check() {
>   return this.health.check([
>     () => this.db.pingCheck('postgres'),
>     () => this.redis.pingCheck('redis'),
>     () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
>   ]);
> }
> 
> @Get('super-admin/health')
> @Roles(Role.SUPER_ADMIN)
> @UseGuards(JwtAuthGuard, RolesGuard)
> async detailedCheck() {
>   const [postgres, redis, disk] = await Promise.all([
>     this.db.pingCheck('postgres'),
>     this.redis.pingCheck('redis'),
>     this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
>   ]);
> 
>   const lastBackup = await this.getLastBackupDate();
> 
>   return {
>     status: 'healthy',
>     timestamp: new Date(),
>     uptime: process.uptime(),
>     services: { postgres, redis, disk },
>     server: {
>       cpuUsage: process.cpuUsage(),
>       memoryUsage: process.memoryUsage(),
>     },
>     lastBackup,
>   };
> }
> ```

---

### **Étape 12.2 : Audit Logs Consultation**

**Demande à Cursor** :
> Ajoute endpoint audit logs dans module Admin :
> 
> **Endpoint** :
> - `GET /super-admin/audit-logs` (SUPER_ADMIN)
> 
> **AdminService** :
> - `getAuditLogs(filters)` :
>   - Filtre : action, resource, userId, companyId, startDate, endDate
>   - Tri : createdAt DESC
>   - Pagination
>   - Retourne logs avec détails (sans données sensibles chiffrées)
> 
> **DTO** :
> - AuditLogsFilterDto

---

## 🚀 PHASE 13 : DÉPLOIEMENT (1 jour)

### **Étape 13.1 : Docker Setup**

**Demande à Cursor** :
> Crée fichiers Docker pour le backend :
> 
> **Dockerfile** :
> ```dockerfile
> # Build stage
> FROM node:18-alpine AS builder
> WORKDIR /app
> COPY package*.json ./
> COPY prisma ./prisma/
> RUN npm ci
> COPY . .
> RUN npm run build
> RUN npm prune --production
> 
> # Production stage
> FROM node:18-alpine
> WORKDIR /app
> COPY --from=builder /app/node_modules ./node_modules
> COPY --from=builder /app/dist ./dist
> COPY --from=builder /app/prisma ./prisma
> COPY package*.json ./
> 
> EXPOSE 3000 3001
> 
> CMD ["npm", "run", "start:prod"]
> ```
> 
> **docker-compose.yml** :
> ```yaml
> version: '3.8'
> 
> services:
>   postgres:
>     image: postgres:15-alpine
>     environment:
>       POSTGRES_USER: huntzen
>       POSTGRES_PASSWORD: huntzen2025
>       POSTGRES_DB: huntzen_care
>     volumes:
>       - postgres_data:/var/lib/postgresql/data
>     ports:
>       - "5432:5432"
> 
>   redis:
>     image: redis:7-alpine
>     ports:
>       - "6379:6379"
>     volumes:
>       - redis_data:/data
> 
>   backend:
>     build: .
>     depends_on:
>       - postgres
>       - redis
>     environment:
>       DATABASE_URL: postgresql://huntzen:huntzen2025@postgres:5432/huntzen_care
>       REDIS_HOST: redis
>       REDIS_PORT: 6379
>     env_file:
>       - .env
>     ports:
>       - "3000:3000"
>       - "3001:3001"
>     volumes:
>       - ./uploads:/app/uploads
> 
> volumes:
>   postgres_data:
>   redis_data:
> ```
> 
> **.dockerignore** :
> ```
> node_modules
> dist
> .env
> .git
> *.md
> ```

---

### **Étape 13.2 : Scripts NPM**

**Demande à Cursor** :
> Ajoute scripts utiles dans `package.json` :
> 
> ```json
> "scripts": {
>   "build": "nest build",
>   "start": "nest start",
>   "start:dev": "nest start --watch",
>   "start:debug": "nest start --debug --watch",
>   "start:prod": "node dist/main",
>   "prisma:generate": "prisma generate",
>   "prisma:migrate": "prisma migrate dev",
>   "prisma:deploy": "prisma migrate deploy",
>   "prisma:studio": "prisma studio",
>   "prisma:seed": "ts-node prisma/seeds/seed.ts",
>   "test": "jest",
>   "test:watch": "jest --watch",
>   "test:cov": "jest --coverage",
>   "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
>   "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
>   "docker:up": "docker-compose up -d",
>   "docker:down": "docker-compose down",
>   "docker:build": "docker-compose build"
> }
> ```

---

## ✅ CHECKLIST FINALE AVANT DÉPLOIEMENT

### **Sécurité**
- [ ] Toutes les variables sensibles dans `.env` (jamais en dur)
- [ ] ENCRYPTION_KEY généré aléatoirement (64 hex chars)
- [ ] JWT_SECRET unique et fort
- [ ] Helmet activé
- [ ] CORS configuré avec origin spécifique (pas '*' en prod)
- [ ] Rate limiting actif sur routes sensibles
- [ ] Validation globale activée (whitelist: true)
- [ ] RLS PostgreSQL activé sur tables sensibles

### **Base de données**
- [ ] Migrations appliquées
- [ ] Index créés (voir document 02)
- [ ] Vues matérialisées créées
- [ ] Triggers installés (audit, duration)
- [ ] Seed exécuté (données de test)

### **Fonctionnalités**
- [ ] Tous les endpoints testés (Postman/Insomnia)
- [ ] WebSocket chat fonctionnel
- [ ] WebSocket audio call fonctionnel
- [ ] Jitsi intégration testée
- [ ] Chiffrement E2E validé (notes + journal + messages)
- [ ] Emails envoyés correctement
- [ ] Notifications in-app fonctionnelles
- [ ] Upload fichiers opérationnel
- [ ] Exports CSV générés correctement
- [ ] 2FA opérationnel

### **Performance**
- [ ] Vues matérialisées rafraîchies (CRON)
- [ ] Redis cache connecté
- [ ] Compression activée
- [ ] Queries optimisées (utilise index)

### **Monitoring**
- [ ] Health check endpoint accessible
- [ ] Audit logs enregistrés correctement
- [ ] Logs structurés (Winston)
- [ ] Sentry configuré (optionnel)

### **Documentation**
- [ ] README.md complet
- [ ] Swagger/OpenAPI généré (`@nestjs/swagger`)
- [ ] Variables d'environnement documentées (`.env.example`)
- [ ] Guide de déploiement

---

## 🎯 ORDRE DE DÉVELOPPEMENT RÉSUMÉ

**Semaine 1** :
- Phase 0 : Setup (1j)
- Phase 1 : Auth (2j)
- Phase 2 : Entreprises & Employés (2j)

**Semaine 2** :
- Phase 3 : Praticiens & Dispos (2j)
- Phase 4 : Consultations (3j)

**Semaine 3** :
- Phase 5 : Chat temps réel (2j)
- Phase 6 : Notes & Journal (1j)
- Phase 7 : Compteurs & Exports (2j)

**Semaine 4** :
- Phase 8 : Blog & News (1j)
- Phase 9 : Notifications (1j)
- Phase 10 : Upload fichiers (1j)
- Phase 11 : Sécurité & RGPD (2j)

**Semaine 5** :
- Phase 12 : Monitoring & Admin (1j)
- Phase 13 : Déploiement (1j)
- Tests & Debug (3j)

**TOTAL : ~25 jours de développement backend**

---

## 💡 BONNES PRATIQUES CURSOR

### **Prompt Efficace**

**Au lieu de** :
> "Crée le module companies"

**Utiliser** :
> "Crée le module Companies dans `src/modules/companies/` avec :
> - CompaniesModule (imports: PrismaModule, JwtModule)
> - CompaniesController (routes CRUD + validate)
> - CompaniesService (méthodes: create, findAll, findOne, update, validate)
> - DTOs: CreateCompanyDto, UpdateCompanyDto
> - Guards: @UseGuards(JwtAuthGuard, RolesGuard) sur routes protégées
> - Roles: @Roles(Role.ADMIN_HUNTZEN) sur create/validate
> - Validation: class-validator sur DTOs
> - Gestion erreurs: try/catch avec throw HttpException approprié
> 
> Implémente la méthode `create()` qui :
> 1. Génère slug unique depuis name (slugify + vérif unicité)
> 2. Crée company avec isActive: false
> 3. Retourne company créée
> 
> Code complet s'il te plaît."

### **Itérations**

Si Cursor ne génère pas tout :
> "Continue le code précédent en ajoutant la méthode `validate()` qui :
> 1. Trouve company by id
> 2. Set isActive=true, validatedAt=now(), validatedBy=adminId
> 3. Envoie email confirmation (via EmailService)
> 4. Crée audit log
> 5. Retourne company mise à jour"

### **Debug**

Si erreur :
> "J'ai l'erreur suivante : [copier erreur]
> Analyse le code et corrige-le."

---

**FIN DU GUIDE D'IMPLÉMENTATION** 🎉

**Ce guide couvre 100% du backend nécessaire pour HuntZen Care !**
