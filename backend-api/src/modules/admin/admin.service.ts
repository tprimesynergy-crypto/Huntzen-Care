import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { Role, Specialty } from '@prisma/client';

interface CreateAdminUserDto {
  email: string;
  role: Role;
  companyId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  position?: string | null;
}

interface UpdateAdminUserDto {
  email?: string;
  role?: Role;
  companyId?: string | null;
  isActive?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  position?: string | null;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async createAdminUser(creatorUserId: string, data: CreateAdminUserDto) {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorUserId },
      select: { id: true, role: true, companyId: true },
    });

    if (!creator) {
      throw new ForbiddenException("Utilisateur créateur introuvable.");
    }

    const isPlatformAdmin =
      creator.role === Role.SUPER_ADMIN || creator.role === Role.ADMIN_HUNTZEN;
    const isAdminRH = creator.role === Role.ADMIN_RH;

    if (!isPlatformAdmin && !isAdminRH) {
      throw new ForbiddenException(
        "Seuls les administrateurs HuntZen ou RH peuvent créer des comptes administrateurs.",
      );
    }

    if (data.role !== Role.ADMIN_RH && data.role !== Role.ADMIN_HUNTZEN) {
      throw new ForbiddenException(
        "Vous ne pouvez créer que des comptes ADMIN_RH ou ADMIN_HUNTZEN.",
      );
    }

    // ADMIN_RH can only create ADMIN_RH for their own company
    if (isAdminRH) {
      if (data.role !== Role.ADMIN_RH) {
        throw new ForbiddenException(
          "Un compte RH ne peut créer que des comptes RH / DRH pour son entreprise.",
        );
      }
      if (!creator.companyId) {
        throw new ForbiddenException(
          "Votre compte RH n'est rattaché à aucune entreprise.",
        );
      }
    }

    const targetCompanyId = isAdminRH
      ? creator.companyId
      : (data.companyId ?? creator.companyId ?? null);

    const emailNormalized = data.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    const temporaryPassword = 'Password123';
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash,
        role: data.role,
        companyId: targetCompanyId ?? undefined,
        isActive: true,
      },
    });

    // Créer un profil admin si des infos sont fournies
    if (data.firstName || data.lastName || data.phoneNumber || data.position) {
      await this.prisma.adminProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName ?? null,
          lastName: data.lastName ?? null,
          phoneNumber: data.phoneNumber ?? null,
          position: data.position ?? null,
        },
      });
    }

    this.activityService.log({
      actorUserId: creatorUserId,
      action: 'ADMIN_USER_CREATE',
      entityType: 'user',
      entityId: user.id,
      details: data.email,
    }).catch(() => {});

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      temporaryPassword,
    };
  }

  private async assertPlatformAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new ForbiddenException('Utilisateur introuvable.');
    }

    if (user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN_HUNTZEN) {
      throw new ForbiddenException(
        'Accès réservé aux administrateurs HuntZen.',
      );
    }
  }

  private async assertSuperAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Accès réservé au Super Admin.',
      );
    }
  }

  /** Returns acting user's role and companyId; throws if not an admin (SUPER_ADMIN, ADMIN_HUNTZEN, or ADMIN_RH). */
  private async getActingAdminContext(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    if (!user) {
      throw new ForbiddenException('Utilisateur introuvable.');
    }

    const allowed =
      user.role === Role.SUPER_ADMIN ||
      user.role === Role.ADMIN_HUNTZEN ||
      user.role === Role.ADMIN_RH;

    if (!allowed) {
      throw new ForbiddenException(
        'Accès réservé aux administrateurs HuntZen ou RH.',
      );
    }

    return { role: user.role, companyId: user.companyId };
  }

  async listAdminUsers(actingUserId: string) {
    const ctx = await this.getActingAdminContext(actingUserId);

    const where: any = {
      role: { in: [Role.ADMIN_RH, Role.ADMIN_HUNTZEN] },
    };
    if (ctx.role === Role.ADMIN_RH && ctx.companyId) {
      where.companyId = ctx.companyId;
    }

    const admins = await this.prisma.user.findMany({
      where,
      include: {
        adminProfile: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return admins.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      companyId: u.companyId,
      companyName: u.company?.name ?? null,
      firstName: u.adminProfile?.firstName ?? null,
      lastName: u.adminProfile?.lastName ?? null,
    }));
  }

  async getActivityLogs(
    actingUserId: string,
    params: { from?: string; to?: string; action?: string; actorUserId?: string; page?: number; limit?: number },
  ) {
    await this.assertSuperAdmin(actingUserId);
    const from = params.from ? new Date(params.from) : undefined;
    const to = params.to ? new Date(params.to) : undefined;
    return this.activityService.getActivityLogs(actingUserId, {
      from,
      to,
      action: params.action,
      actorUserId: params.actorUserId,
      page: params.page,
      limit: params.limit,
    });
  }

  async updateAdminUser(
    actingUserId: string,
    userId: string,
    data: UpdateAdminUserDto,
  ) {
    const ctx = await this.getActingAdminContext(actingUserId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur administrateur introuvable.');
    }

    if (ctx.role === Role.ADMIN_RH && user.companyId !== ctx.companyId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que les comptes de votre entreprise.',
      );
    }

    const updates: any = {};

    if (data.email !== undefined) {
      const emailNormalized = data.email.trim().toLowerCase();
      const otherWithEmail = await this.prisma.user.findFirst({
        where: {
          email: emailNormalized,
          id: { not: userId },
        },
      });
      if (otherWithEmail) {
        throw new ConflictException('Cet email est déjà utilisé par un autre compte.');
      }
      updates.email = emailNormalized;
    }
    if (data.role !== undefined) {
      if (data.role !== Role.ADMIN_RH && data.role !== Role.ADMIN_HUNTZEN) {
        throw new ForbiddenException(
          'Le rôle doit être ADMIN_RH ou ADMIN_HUNTZEN.',
        );
      }
      if (ctx.role === Role.ADMIN_RH && data.role !== Role.ADMIN_RH) {
        throw new ForbiddenException(
          'Un compte RH ne peut attribuer que le rôle ADMIN_RH.',
        );
      }
      updates.role = data.role;
    }
    if (data.companyId !== undefined) {
      if (ctx.role === Role.ADMIN_RH && data.companyId !== ctx.companyId) {
        throw new ForbiddenException(
          'Un compte RH ne peut rattacher qu’à son entreprise.',
        );
      }
      updates.companyId = data.companyId;
    }
    if (data.isActive !== undefined) {
      updates.isActive = data.isActive;
    }

    if (Object.keys(updates).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: updates,
      });
    }

    // Mettre à jour le profil admin si nécessaire
    const profileData: any = {};
    if (data.firstName !== undefined) profileData.firstName = data.firstName;
    if (data.lastName !== undefined) profileData.lastName = data.lastName;
    if (data.phoneNumber !== undefined) profileData.phoneNumber = data.phoneNumber;
    if (data.position !== undefined) profileData.position = data.position;

    if (Object.keys(profileData).length > 0) {
      await this.prisma.adminProfile.upsert({
        where: { userId },
        create: { userId, ...profileData },
        update: profileData,
      });
    }

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'ADMIN_USER_UPDATE',
      entityType: 'user',
      entityId: userId,
      details: user.email,
    }).catch(() => {});

    return { ok: true };
  }

  async updateAdminPassword(
    actingUserId: string,
    userId: string,
    newPassword: string,
  ) {
    const ctx = await this.getActingAdminContext(actingUserId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur administrateur introuvable.');
    }

    if (ctx.role === Role.ADMIN_RH && user.companyId !== ctx.companyId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier le mot de passe que des comptes de votre entreprise.',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { ok: true };
  }

  async listCompanies(actingUserId: string) {
    const ctx = await this.getActingAdminContext(actingUserId);

    const where: any = {};
    if (ctx.role === Role.ADMIN_RH && ctx.companyId) {
      where.id = ctx.companyId;
    }

    const companies = await this.prisma.company.findMany({
      where,
      include: {
        employees: {
          select: { id: true },
        },
        users: {
          where: {
            role: { in: [Role.ADMIN_RH, Role.ADMIN_HUNTZEN] },
          },
          select: { id: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      legalName: c.legalName,
      siret: c.siret,
      sector: c.sector,
      address: c.address,
      city: c.city,
      country: c.country,
      logoUrl: c.logoUrl,
      coverUrl: c.coverUrl,
      isActive: c.isActive,
      createdAt: c.createdAt,
      employeesCount: c.employees.length,
      adminsCount: c.users.length,
    }));
  }

  async updateCompany(
    actingUserId: string,
    companyId: string,
    data: {
      name?: string;
      slug?: string;
      legalName?: string | null;
      siret?: string | null;
      sector?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
      logoUrl?: string | null;
      coverUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    const ctx = await this.getActingAdminContext(actingUserId);
    if (ctx.role === Role.ADMIN_RH && companyId !== ctx.companyId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que votre entreprise.',
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Entreprise introuvable.');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.legalName !== undefined) updateData.legalName = data.legalName;
    if (data.siret !== undefined) updateData.siret = data.siret;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await this.prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'COMPANY_UPDATE',
      entityType: 'company',
      entityId: companyId,
      details: company.name,
    }).catch(() => {});

    return { ok: true };
  }

  async createCompany(
    actingUserId: string,
    data: {
      name: string;
      slug: string;
      legalName?: string | null;
      siret?: string | null;
      sector?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
      logoUrl?: string | null;
      coverUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    await this.assertPlatformAdmin(actingUserId);

    const company = await this.prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug,
        legalName: data.legalName ?? null,
        siret: data.siret ?? null,
        sector: data.sector ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        country: data.country ?? 'France',
        logoUrl: data.logoUrl ?? null,
        coverUrl: data.coverUrl ?? null,
        isActive: data.isActive ?? false,
      },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'COMPANY_CREATE',
      entityType: 'company',
      entityId: company.id,
      details: company.name,
    }).catch(() => {});

    return company;
  }

  async listEmployeesByCompany(actingUserId: string, companyId: string) {
    const ctx = await this.getActingAdminContext(actingUserId);
    if (ctx.role === Role.ADMIN_RH && companyId !== ctx.companyId) {
      throw new ForbiddenException(
        'Vous ne pouvez consulter que les employés de votre entreprise.',
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Entreprise introuvable.');
    }

    const employees = await this.prisma.employee.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return employees.map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      department: e.department,
      position: e.position,
      phoneNumber: e.phoneNumber,
      email: e.user?.email ?? null,
      isActive: e.user?.isActive ?? false,
    }));
  }

  // ---------- Platform stats & practitioners (ADMIN_HUNTZEN / SUPER_ADMIN only) ----------

  async getPlatformStats(actingUserId: string) {
    await this.assertPlatformAdmin(actingUserId);

    // Auto-complete consultations that are CONFIRMED and past their end time
    await this.prisma.consultation.updateMany({
      where: { status: 'CONFIRMED', scheduledEndAt: { lt: new Date() } },
      data: { status: 'COMPLETED' },
    });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      practitionersTotal,
      practitionersActive,
      practitionersValidated,
      companiesTotal,
      employeesTotal,
      consultationsTotal,
      consultationsThisMonth,
      consultationsCompleted,
    ] = await Promise.all([
      this.prisma.practitioner.count(),
      this.prisma.practitioner.count({ where: { isActive: true } }),
      this.prisma.practitioner.count({ where: { isValidated: true } }),
      this.prisma.company.count({ where: { isActive: true } }),
      this.prisma.employee.count(),
      this.prisma.consultation.count(),
      this.prisma.consultation.count({
        where: { scheduledAt: { gte: thisMonthStart } },
      }),
      this.prisma.consultation.count({ where: { status: 'COMPLETED' } }),
    ]);

    return {
      practitionersTotal,
      practitionersActive,
      practitionersValidated,
      companiesTotal,
      employeesTotal,
      consultationsTotal,
      consultationsThisMonth,
      consultationsCompleted,
    };
  }

  async listPractitioners(actingUserId: string) {
    await this.assertPlatformAdmin(actingUserId);

    const list = await this.prisma.practitioner.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        title: true,
        professionalId: true,
        specialty: true,
        customSpecialty: true,
        subSpecialties: true,
        languages: true,
        bio: true,
        experience: true,
        education: true,
        avatarUrl: true,
        coverUrl: true,
        offersVideo: true,
        offersPhone: true,
        isValidated: true,
        validatedAt: true,
        defaultDuration: true,
        timezone: true,
        isActive: true,
        isAcceptingNewClients: true,
        createdAt: true,
        user: { select: { email: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((p) => ({
      id: p.id,
      userId: p.userId,
      email: p.user?.email ?? null,
      firstName: p.firstName,
      lastName: p.lastName,
      title: p.title,
      professionalId: p.professionalId,
      specialty: p.specialty,
      customSpecialty: p.customSpecialty ?? null,
      subSpecialties: p.subSpecialties,
      languages: p.languages,
      bio: p.bio,
      experience: p.experience,
      education: p.education,
      avatarUrl: p.avatarUrl,
      coverUrl: p.coverUrl,
      offersVideo: p.offersVideo,
      offersPhone: p.offersPhone,
      isValidated: p.isValidated,
      validatedAt: p.validatedAt,
      defaultDuration: p.defaultDuration,
      timezone: p.timezone,
      isActive: p.isActive,
      isAcceptingNewClients: p.isAcceptingNewClients,
      companyId: null,
      companyName: null,
      userIsActive: p.user?.isActive ?? false,
      createdAt: p.createdAt,
    }));
  }

  async createPractitioner(
    actingUserId: string,
    data: {
      email: string;
      password?: string;
      firstName: string;
      lastName: string;
      title: string;
      professionalId?: string | null;
      specialty: Specialty;
      customSpecialty?: string | null;
      subSpecialties?: string[];
      languages?: string[];
      bio: string;
      experience?: number | null;
      education?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
      offersVideo?: boolean;
      offersPhone?: boolean;
      isValidated?: boolean;
      defaultDuration?: number;
      timezone?: string;
      isActive?: boolean;
      isAcceptingNewClients?: boolean;
      companyId?: string | null;
    },
  ) {
    await this.assertPlatformAdmin(actingUserId);

    const emailNormalized = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    const passwordHash = await bcrypt.hash(data.password || 'Password123', 10);
    const user = await this.prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash,
        role: Role.PRACTITIONER,
        isActive: data.isActive !== false,
      },
    });

    const practitioner = await this.prisma.practitioner.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title,
        professionalId: data.professionalId ?? null,
        specialty: data.specialty,
        customSpecialty: data.customSpecialty ?? null,
        subSpecialties: data.subSpecialties ?? [],
        languages: data.languages ?? [],
        bio: data.bio,
        experience: data.experience ?? null,
        education: data.education ?? null,
        avatarUrl: data.avatarUrl ?? null,
        coverUrl: data.coverUrl ?? null,
        offersVideo: data.offersVideo !== false,
        offersPhone: data.offersPhone !== false,
        isValidated: data.isValidated ?? false,
        validatedAt: data.isValidated ? new Date() : null,
        defaultDuration: data.defaultDuration ?? 50,
        timezone: data.timezone ?? 'Europe/Paris',
        isActive: data.isActive !== false,
        isAcceptingNewClients: data.isAcceptingNewClients !== false,
        companyId: data.companyId ?? null,
      },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'PRACTITIONER_CREATE',
      entityType: 'practitioner',
      entityId: practitioner.id,
      details: user.email,
    }).catch(() => {});

    return { id: practitioner.id, userId: user.id, email: user.email };
  }

  async updatePractitioner(
    actingUserId: string,
    practitionerId: string,
    data: {
      firstName?: string;
      lastName?: string;
      title?: string;
      professionalId?: string | null;
      specialty?: Specialty;
      customSpecialty?: string | null;
      subSpecialties?: string[];
      languages?: string[];
      bio?: string;
      experience?: number | null;
      education?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
      offersVideo?: boolean;
      offersPhone?: boolean;
      isValidated?: boolean;
      defaultDuration?: number;
      timezone?: string;
      isActive?: boolean;
      isAcceptingNewClients?: boolean;
      companyId?: string | null;
    },
  ) {
    await this.assertPlatformAdmin(actingUserId);

    const p = await this.prisma.practitioner.findUnique({
      where: { id: practitionerId },
      select: { id: true, userId: true },
    });
    if (!p) {
      throw new NotFoundException('Praticien introuvable.');
    }

    const updateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.professionalId !== undefined) updateData.professionalId = data.professionalId ?? null;
    if (data.specialty !== undefined) updateData.specialty = data.specialty;
    if (data.customSpecialty !== undefined) updateData.customSpecialty = data.customSpecialty ?? null;
    if (data.subSpecialties !== undefined) updateData.subSpecialties = Array.isArray(data.subSpecialties) ? data.subSpecialties : [];
    if (data.languages !== undefined) updateData.languages = Array.isArray(data.languages) ? data.languages : [];
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.experience !== undefined) {
      const exp = data.experience;
      updateData.experience = typeof exp === 'number' && Number.isFinite(exp) ? exp : null;
    }
    if (data.education !== undefined) updateData.education = data.education ?? null;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl ?? null;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl ?? null;
    if (data.offersVideo !== undefined) updateData.offersVideo = data.offersVideo;
    if (data.offersPhone !== undefined) updateData.offersPhone = data.offersPhone;
    if (data.isValidated !== undefined) {
      updateData.isValidated = data.isValidated;
      updateData.validatedAt = data.isValidated ? new Date() : null;
    }
    if (data.defaultDuration !== undefined) {
      const d = data.defaultDuration;
      updateData.defaultDuration = typeof d === 'number' && Number.isInteger(d) && d > 0 ? d : 50;
    }
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isAcceptingNewClients !== undefined) updateData.isAcceptingNewClients = data.isAcceptingNewClients;

    try {
      if (Object.keys(updateData).length > 0) {
        await this.prisma.practitioner.update({
          where: { id: practitionerId },
          data: updateData as any,
        });
      }

      if (data.isActive !== undefined) {
        await this.prisma.user.update({
          where: { id: p.userId },
          data: { isActive: data.isActive },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
      const meta = err && typeof err === 'object' && 'meta' in err ? (err as { meta: unknown }).meta : undefined;
      this.logger.error(`[updatePractitioner] ${message}`, stack);
      console.error('[updatePractitioner] ERROR:', {
        message,
        code,
        meta,
        stack: stack?.split('\n').slice(0, 5).join('\n'),
      });
      throw err;
    }

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'PRACTITIONER_UPDATE',
      entityType: 'practitioner',
      entityId: practitionerId,
      details: undefined,
    }).catch(() => {});

    return { ok: true };
  }

  async setPractitionerActive(actingUserId: string, practitionerId: string, isActive: boolean) {
    await this.assertPlatformAdmin(actingUserId);

    const p = await this.prisma.practitioner.findUnique({
      where: { id: practitionerId },
      select: { id: true, userId: true },
    });
    if (!p) {
      throw new NotFoundException('Praticien introuvable.');
    }

    await this.prisma.practitioner.update({
      where: { id: practitionerId },
      data: { isActive },
    });
    await this.prisma.user.update({
      where: { id: p.userId },
      data: { isActive },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: isActive ? 'PRACTITIONER_ACTIVATE' : 'PRACTITIONER_DEACTIVATE',
      entityType: 'practitioner',
      entityId: practitionerId,
      details: String(isActive),
    }).catch(() => {});

    return { ok: true };
  }

  async setPractitionerPassword(actingUserId: string, practitionerId: string, newPassword: string) {
    await this.assertPlatformAdmin(actingUserId);

    const p = await this.prisma.practitioner.findUnique({
      where: { id: practitionerId },
      select: { id: true, userId: true },
    });
    if (!p) {
      throw new NotFoundException('Praticien introuvable.');
    }
    const trimmed = newPassword?.trim();
    if (!trimmed || trimmed.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');
    }
    const passwordHash = await bcrypt.hash(trimmed, 10);
    await this.prisma.user.update({
      where: { id: p.userId },
      data: { passwordHash },
    });
    return { ok: true };
  }

  async deletePractitioner(actingUserId: string, practitionerId: string) {
    await this.assertPlatformAdmin(actingUserId);

    const p = await this.prisma.practitioner.findUnique({
      where: { id: practitionerId },
      include: { user: { select: { email: true } } },
    });
    if (!p) {
      throw new NotFoundException('Praticien introuvable.');
    }

    const details = p.user?.email ?? practitionerId;

    await this.prisma.practitioner.delete({
      where: { id: practitionerId },
    });
    await this.prisma.user.delete({
      where: { id: p.userId },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'PRACTITIONER_DELETE',
      entityType: 'practitioner',
      entityId: practitionerId,
      details,
    }).catch(() => {});

    return { ok: true };
  }

  async deleteAdminUser(actingUserId: string, userId: string) {
    const ctx = await this.getActingAdminContext(actingUserId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyId: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    if (user.role !== Role.ADMIN_RH && user.role !== Role.ADMIN_HUNTZEN) {
      throw new ForbiddenException(
        'Seuls les comptes RH / DRH ou Admin HuntZen peuvent être supprimés ici.',
      );
    }
    if (ctx.role === Role.ADMIN_RH && user.companyId !== ctx.companyId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que les comptes de votre entreprise.',
      );
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'ADMIN_USER_DELETE',
      entityType: 'user',
      entityId: userId,
      details: user.email,
    }).catch(() => {});

    return { ok: true };
  }

  async deleteCompany(actingUserId: string, companyId: string) {
    await this.assertPlatformAdmin(actingUserId);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!company) {
      throw new NotFoundException('Entreprise introuvable.');
    }

    await this.prisma.company.delete({
      where: { id: companyId },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'COMPANY_DELETE',
      entityType: 'company',
      entityId: companyId,
      details: company.name,
    }).catch(() => {});

    return { ok: true };
  }
}

