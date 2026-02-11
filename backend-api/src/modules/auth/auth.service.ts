import { ConflictException, Injectable, UnauthorizedException, InternalServerErrorException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private activityService: ActivityService,
  ) {}

  /** Public: validate an invitation token (for the register page). */
  async validateInvitationToken(token: string) {
    const inv = await this.prisma.invitation.findUnique({
      where: { token: token.trim() },
      include: { company: { select: { name: true } } },
    });
    if (!inv) {
      throw new NotFoundException('Lien d\'invitation invalide.');
    }
    if (inv.usedAt && inv.singleUse) {
      throw new NotFoundException('Ce lien d\'invitation a déjà été utilisé.');
    }
    if (inv.expiresAt && inv.expiresAt < new Date()) {
      throw new NotFoundException('Ce lien d\'invitation a expiré.');
    }
    return {
      valid: true,
      companyName: inv.company.name,
      email: inv.email ?? undefined,
      singleUse: inv.singleUse,
      autoApproved: inv.autoApproved,
    };
  }

  async register(dto: RegisterDto) {
    const emailNormalized = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    let companyId: string | null = dto.companyId ?? null;
    let isActive = true;
    let createEmployee: { companyId: string; firstName: string; lastName: string } | null = null;
    let invitationIdToMarkUsed: string | null = null;

    if (dto.invitationToken?.trim()) {
      const inv = await this.prisma.invitation.findUnique({
        where: { token: dto.invitationToken.trim() },
      });
      if (!inv) {
        throw new NotFoundException('Lien d\'invitation invalide.');
      }
      if (inv.singleUse && inv.usedAt) {
        throw new BadRequestException('Ce lien d\'invitation a déjà été utilisé.');
      }
      if (inv.expiresAt && inv.expiresAt < new Date()) {
        throw new BadRequestException('Ce lien d\'invitation a expiré.');
      }
      if (inv.email && inv.email.toLowerCase() !== emailNormalized) {
        throw new BadRequestException('Ce lien d\'invitation est réservé à l\'adresse indiquée par votre RH.');
      }
      companyId = inv.companyId;
      isActive = inv.autoApproved;
      if (inv.singleUse) invitationIdToMarkUsed = inv.id;
      const firstName = (dto.firstName?.trim() || 'À compléter').slice(0, 255);
      const lastName = (dto.lastName?.trim() || 'À compléter').slice(0, 255);
      createEmployee = { companyId: inv.companyId, firstName, lastName };
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash: hashedPassword,
        role: (dto.role as Role) ?? Role.EMPLOYEE,
        companyId,
        isActive,
      },
    });

    if (createEmployee) {
      await this.prisma.employee.create({
        data: {
          userId: user.id,
          companyId: createEmployee.companyId,
          firstName: createEmployee.firstName,
          lastName: createEmployee.lastName,
        },
      });
      if (invitationIdToMarkUsed) {
        await this.prisma.invitation.update({
          where: { id: invitationIdToMarkUsed },
          data: { usedAt: new Date(), usedByUserId: user.id },
        });
      }
    }

    this.activityService.log({
      actorUserId: user.id,
      action: 'REGISTER',
      entityType: 'user',
      entityId: user.id,
      details: user.email,
    }).catch(() => {});

    const requiresValidation = !isActive;

    const response: {
      accessToken?: string;
      user: { id: string; email: string; role: string };
      requiresValidation?: boolean;
    } = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    if (requiresValidation) {
      response.requiresValidation = true;
      // Do not issue a token so the user cannot log in until the RH activates the account.
      // Notify the HR who created the invitation that an account is waiting for validation.
      if (dto.invitationToken?.trim()) {
        const inv = await this.prisma.invitation.findUnique({
          where: { token: dto.invitationToken.trim() },
          select: { createdByUserId: true },
        });
        if (inv?.createdByUserId) {
          try {
            await this.notificationsService.create(
              inv.createdByUserId,
              'SYSTEM',
              'Compte en attente de validation',
              `Un nouvel employé (${user.email}) a créé son compte et attend votre validation pour pouvoir se connecter.`,
              undefined,
              'Voir dans Suivi Employés',
            );
          } catch (err) {
            this.logger.warn(`Failed to notify HR of pending account: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
    } else {
      const payload = { sub: user.id, email: user.email, role: user.role };
      response.accessToken = this.jwtService.sign(payload);
    }

    return response;
  }

  async login(dto: LoginDto) {
    try {
      const emailNormalized = dto.email?.trim().toLowerCase();
      const user = await this.prisma.user.findUnique({
        where: { email: emailNormalized },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }).catch((err) => {
        this.logger.warn(`lastLoginAt update failed for ${user.id}: ${err instanceof Error ? err.message : err}`);
      });

      this.activityService.log({
        actorUserId: user.id,
        action: 'LOGIN',
        entityType: 'auth',
        details: user.email,
      }).catch(() => {});

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error(`Login failed for ${dto.email}: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Une erreur est survenue lors de la connexion.');
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Optionally load admin profile data for admin roles
    let adminProfile: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
      position: string | null;
    } | null = null;

    if (
      user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN_HUNTZEN' ||
      user.role === 'ADMIN_RH'
    ) {
      adminProfile = await this.prisma.adminProfile.findUnique({
        where: { userId: user.id },
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          position: true,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      firstName: adminProfile?.firstName ?? null,
      lastName: adminProfile?.lastName ?? null,
      phoneNumber: adminProfile?.phoneNumber ?? null,
      position: adminProfile?.position ?? null,
    };
  }

  async updateMe(
    userId: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      position?: string;
    },
  ) {
    // Load user to know their role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    // Update basic user fields (email)
    const userUpdates: any = {};
    if (data.email && data.email.trim()) {
      const emailNormalized = data.email.trim().toLowerCase();
      const otherWithEmail = await this.prisma.user.findFirst({
        where: {
          email: emailNormalized,
          id: { not: userId },
        },
      });
      if (otherWithEmail) {
        throw new ConflictException('Cet email est déjà utilisé.');
      }
      userUpdates.email = emailNormalized;
    }

    if (Object.keys(userUpdates).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    // For admin roles, also upsert AdminProfile with personal info
    if (
      user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN_HUNTZEN' ||
      user.role === 'ADMIN_RH'
    ) {
      const profileData: any = {};
      if (data.firstName !== undefined) profileData.firstName = data.firstName || null;
      if (data.lastName !== undefined) profileData.lastName = data.lastName || null;
      if (data.phoneNumber !== undefined) profileData.phoneNumber = data.phoneNumber || null;
      if (data.position !== undefined) profileData.position = data.position || null;

      // Only upsert if there is at least one profile-related field
      if (Object.keys(profileData).length > 0) {
        await this.prisma.adminProfile.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
            ...profileData,
          },
          update: profileData,
        });
      }
    }

    // Return the same shape as validateUser
    return this.validateUser(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Mot de passe actuel incorrect.');
    }
    const trimmed = newPassword.trim();
    if (trimmed.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères.');
    }
    const passwordHash = await bcrypt.hash(trimmed, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true };
  }

  async exportMyData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        employee: {
          include: {
            company: { select: { name: true } },
            consultations: {
              include: {
                practitioner: { select: { firstName: true, lastName: true, title: true, specialty: true } },
              },
            },
            journalEntries: true,
            favoritePractitioners: { include: { practitioner: { select: { firstName: true, lastName: true, specialty: true } } } },
          },
        },
        practitioner: {
          include: {
            company: { select: { name: true } },
            consultations: {
              include: {
                employee: { select: { firstName: true, lastName: true } },
              },
            },
            availabilities: true,
            favoritedBy: { include: { employee: { select: { firstName: true, lastName: true } } } },
          },
        },
        adminProfile: true,
        notifications: { select: { type: true, title: true, message: true, isRead: true, createdAt: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }
    const messages = await this.prisma.message.findMany({
      where: {
        consultation: {
          OR: [
            { employee: { userId } },
            { practitioner: { userId } },
          ],
        },
      },
      include: { consultation: { select: { id: true, scheduledAt: true } } },
      orderBy: { createdAt: 'asc' },
    });
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      profile: user.employee ?? user.practitioner ?? user.adminProfile ?? null,
      consultations: user.employee?.consultations ?? user.practitioner?.consultations ?? [],
      journalEntries: user.employee?.journalEntries ?? [],
      favoritePractitioners: user.employee?.favoritePractitioners ?? user.practitioner?.favoritedBy ?? [],
      availabilities: user.practitioner?.availabilities ?? [],
      notifications: user.notifications,
      messages: messages.map((m) => ({
        content: m.content,
        senderRole: m.senderRole,
        messageType: m.messageType,
        isRead: m.isRead,
        createdAt: m.createdAt,
        consultationId: m.consultation?.id,
        consultationScheduledAt: m.consultation?.scheduledAt,
      })),
    };
    return exportData;
  }

  async deleteMyAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  }
}
