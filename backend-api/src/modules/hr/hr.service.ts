import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class HRService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async getCompanyIdForUser(userId: string): Promise<string | null> {
    // Check if user is an employee (has company)
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      select: { companyId: true },
    });
    if (employee) return employee.companyId;

    // Check if user is admin and has companyId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, role: true },
    });
    if (user?.companyId) return user.companyId;

    // For SUPER_ADMIN or ADMIN_HUNTZEN, they might not have a company
    // Return null to get global stats
    return null;
  }

  async getStats(userId: string) {
    const companyId = await this.getCompanyIdForUser(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';

    // If no company and not super admin, return empty stats
    if (!companyId && !isSuperAdmin) {
      return {
        totalEmployees: 0,
        activeUsers: 0,
        totalConsultations: 0,
        consultationsThisMonth: 0,
        completedConsultations: 0,
        upcomingConsultations: 0,
        departments: [],
        employeesByDepartment: {},
      };
    }

    // Auto-complete consultations that are CONFIRMED and past their end time
    await this.prisma.consultation.updateMany({
      where: { status: 'CONFIRMED', scheduledEndAt: { lt: new Date() } },
      data: { status: 'COMPLETED' },
    });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build where clause based on role
    const companyWhere = companyId ? { companyId } : {};

    // Total employees enrolled
    const totalEmployees = await this.prisma.employee.count({
      where: companyWhere,
    });

    // Active users (logged in within last 30 days OR have consultations in last 30 days)
    const activeUsers = await this.prisma.user.count({
      where: {
        ...(companyId ? { companyId } : {}),
        OR: [
          { lastLoginAt: { gte: thirtyDaysAgo } },
          {
            employee: {
              consultations: {
                some: {
                  scheduledAt: { gte: thirtyDaysAgo },
                },
              },
            },
          },
        ],
        isActive: true,
        role: 'EMPLOYEE',
      },
    });

    // Total consultations
    const totalConsultations = await this.prisma.consultation.count({
      where: companyWhere,
    });

    // Consultations this month
    const consultationsThisMonth = await this.prisma.consultation.count({
      where: {
        ...companyWhere,
        scheduledAt: { gte: thisMonthStart },
      },
    });

    // Completed consultations
    const completedConsultations = await this.prisma.consultation.count({
      where: {
        ...companyWhere,
        status: 'COMPLETED',
      },
    });

    // Upcoming consultations
    const upcomingConsultations = await this.prisma.consultation.count({
      where: {
        ...companyWhere,
        scheduledAt: { gte: now },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    });

    // Employees by department
    const employeesByDept = await this.prisma.employee.groupBy({
      by: ['department'],
      where: {
        ...companyWhere,
        department: { not: null },
      },
      _count: true,
    });

    const employeesByDepartment: Record<string, number> = {};
    employeesByDept.forEach((item) => {
      if (item.department) {
        employeesByDepartment[item.department] = item._count;
      }
    });

    // Get unique departments
    const departments = Object.keys(employeesByDepartment);

    return {
      totalEmployees,
      activeUsers,
      totalConsultations,
      consultationsThisMonth,
      completedConsultations,
      upcomingConsultations,
      departments,
      employeesByDepartment,
    };
  }

  async getPractitionerStats(userId: string) {
    const companyId = await this.getCompanyIdForUser(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';

    // If no company and not super admin, return empty list
    if (!companyId && !isSuperAdmin) {
      return [];
    }

    const now = new Date();
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const consultations = await this.prisma.consultation.findMany({
      where,
      include: {
        practitioner: true,
      },
    });

    const byPractitioner = new Map<
      string,
      {
        practitioner: any;
        total: number;
        completed: number;
        upcoming: number;
      }
    >();

    consultations.forEach((c) => {
      if (!c.practitioner) return;
      const existing = byPractitioner.get(c.practitionerId) ?? {
        practitioner: c.practitioner,
        total: 0,
        completed: 0,
        upcoming: 0,
      };

      existing.total += 1;
      if (c.status === 'COMPLETED') {
        existing.completed += 1;
      }
      if (
        c.scheduledAt >= now &&
        (c.status === 'SCHEDULED' || c.status === 'CONFIRMED')
      ) {
        existing.upcoming += 1;
      }

      byPractitioner.set(c.practitionerId, existing);
    });

    return Array.from(byPractitioner.values()).map((entry) => ({
      id: entry.practitioner.id,
      firstName: entry.practitioner.firstName,
      lastName: entry.practitioner.lastName,
      title: entry.practitioner.title,
      specialty: entry.practitioner.specialty,
      experience: entry.practitioner.experience,
      totalConsultations: entry.total,
      completedConsultations: entry.completed,
      upcomingConsultations: entry.upcoming,
    }));
  }

  async createEmployee(
    actingUserId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      department?: string;
      position?: string;
      phoneNumber?: string;
      temporaryPassword: string;
    },
  ) {
    const companyId = await this.getCompanyIdForUser(actingUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true },
    });
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';
    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }
    if (!companyId && !isSuperAdmin) {
      throw new BadRequestException('Vous devez être rattaché à une entreprise pour ajouter un employé.');
    }
    const company = companyId
      ? await this.prisma.company.findUnique({ where: { id: companyId } })
      : null;
    if (companyId && !company) {
      throw new BadRequestException('Entreprise introuvable.');
    }
    const effectiveCompanyId = companyId ?? company?.id;
    if (!effectiveCompanyId) {
      throw new BadRequestException('Impossible d\'ajouter un employé sans entreprise.');
    }
    const emailNormalized = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }
    const trimmedPassword = data.temporaryPassword?.trim();
    if (!trimmedPassword || trimmedPassword.length < 8) {
      throw new BadRequestException('Le mot de passe temporaire doit contenir au moins 8 caractères.');
    }
    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    const userCreated = await this.prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash,
        role: 'EMPLOYEE',
        companyId: effectiveCompanyId,
        isActive: true,
      },
    });
    await this.prisma.employee.create({
      data: {
        userId: userCreated.id,
        companyId: effectiveCompanyId,
        firstName: (data.firstName?.trim() || 'À compléter').slice(0, 255),
        lastName: (data.lastName?.trim() || 'À compléter').slice(0, 255),
        department: data.department?.trim() || null,
        position: data.position?.trim() || null,
        phoneNumber: data.phoneNumber?.trim() || null,
      },
    });
    return { ok: true };
  }

  async getEmployees(userId: string) {
    const companyId = await this.getCompanyIdForUser(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';

    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }

    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
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
      role: e.user?.role ?? null,
      isActive: e.user?.isActive ?? false,
    }));
  }

  async getConsultations(userId: string) {
    const companyId = await this.getCompanyIdForUser(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';

    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }

    // ADMIN_RH must be scoped to a company; return empty if none
    if (isAdminRH && !companyId) {
      return [];
    }

    // Consultations of all employees that belong to that company
    const where: { companyId?: string; employee?: { companyId: string } } = {};
    if (companyId) {
      where.companyId = companyId;
      where.employee = { companyId };
    }

    const consultations = await this.prisma.consultation.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        practitioner: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      take: 50,
    });

    return consultations.map((c) => ({
      id: c.id,
      scheduledAt: c.scheduledAt,
      status: c.status,
      format: c.format,
      employee: c.employee
        ? `${c.employee.firstName} ${c.employee.lastName}`.trim()
        : null,
      employeeEmail: c.employee?.user?.email ?? null,
      practitioner: c.practitioner
        ? `${c.practitioner.title || ''} ${c.practitioner.firstName} ${c.practitioner.lastName}`.trim()
        : null,
    }));
  }

  async setEmployeeActive(
    actingUserId: string,
    employeeId: string,
    isActive: boolean,
  ) {
    const companyId = await this.getCompanyIdForUser(actingUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true },
    });

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';

    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (companyId && employee.companyId !== companyId && !isSuperAdmin) {
      throw new ForbiddenException('Vous ne pouvez gérer que les employés de votre entreprise.');
    }

    await this.prisma.user.update({
      where: { id: employee.userId },
      data: {
        isActive,
      },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: isActive ? 'EMPLOYEE_ACTIVATE' : 'EMPLOYEE_DEACTIVATE',
      entityType: 'employee',
      entityId: employeeId,
      details: employee.user?.email ?? undefined,
    }).catch(() => {});

    return { ok: true };
  }

  async updateEmployee(
    actingUserId: string,
    employeeId: string,
    data: { firstName?: string; lastName?: string; department?: string; position?: string; phoneNumber?: string },
  ) {
    const companyId = await this.getCompanyIdForUser(actingUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true },
    });

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';

    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (companyId && employee.companyId !== companyId && !isSuperAdmin) {
      throw new ForbiddenException('Vous ne pouvez gérer que les employés de votre entreprise.');
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
    });

    return { ok: true };
  }

  async setEmployeePassword(actingUserId: string, employeeId: string, newPassword: string) {
    const companyId = await this.getCompanyIdForUser(actingUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true },
    });
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';
    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employé introuvable.');
    }
    if (companyId && employee.companyId !== companyId && !isSuperAdmin) {
      throw new ForbiddenException('Vous ne pouvez gérer que les employés de votre entreprise.');
    }
    const trimmed = newPassword?.trim();
    if (!trimmed || trimmed.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');
    }
    const passwordHash = await bcrypt.hash(trimmed, 10);
    await this.prisma.user.update({
      where: { id: employee.userId },
      data: { passwordHash },
    });
    return { ok: true };
  }

  async deleteEmployee(actingUserId: string, employeeId: string) {
    const companyId = await this.getCompanyIdForUser(actingUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true },
    });
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';
    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: { select: { email: true } } },
    });
    if (!employee) {
      throw new NotFoundException('Employé introuvable.');
    }
    if (companyId && employee.companyId !== companyId && !isSuperAdmin) {
      throw new ForbiddenException('Vous ne pouvez gérer que les employés de votre entreprise.');
    }
    const details = employee.user?.email ?? employeeId;
    await this.prisma.user.delete({
      where: { id: employee.userId },
    });

    this.activityService.log({
      actorUserId: actingUserId,
      action: 'EMPLOYEE_DELETE',
      entityType: 'employee',
      entityId: employeeId,
      details,
    }).catch(() => {});

    return { ok: true };
  }

  /**
   * Create an invitation link for employees.
   * - Unique link: single use, one email. RH invites one person.
   * - Shared link: reusable, no email. RH shares one link with all employees.
   * - autoApproved: when true, accounts created via this link are active immediately; otherwise RH must validate them.
   */
  async createInvitation(
    actingUserId: string,
    data: {
      type: 'unique' | 'shared';
      email?: string;
      autoApproved: boolean;
      expiresInDays?: number;
    },
  ) {
    const companyId = await this.getCompanyIdForUser(actingUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true },
    });
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';
    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }
    if (!companyId && !isSuperAdmin) {
      throw new BadRequestException('Vous devez être rattaché à une entreprise pour créer une invitation.');
    }
    const company = companyId
      ? await this.prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true } })
      : null;
    if (companyId && !company) {
      throw new BadRequestException('Entreprise introuvable.');
    }
    const effectiveCompanyId = companyId ?? company?.id;
    if (!effectiveCompanyId) {
      throw new BadRequestException('Impossible de créer une invitation sans entreprise.');
    }

    const singleUse = data.type === 'unique';
    if (singleUse && !data.email?.trim()) {
      throw new BadRequestException('Un email est requis pour une invitation nominative (lien unique).');
    }
    const emailNormalized = data.email?.trim().toLowerCase() || null;
    const expiresInDays = data.expiresInDays ?? 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const token = crypto.randomBytes(32).toString('base64url');
    const invitation = await this.prisma.invitation.create({
      data: {
        token,
        companyId: effectiveCompanyId,
        email: emailNormalized,
        singleUse,
        expiresAt,
        createdByUserId: actingUserId,
        autoApproved: data.autoApproved,
      },
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${baseUrl}?invitation=${encodeURIComponent(token)}`;

    return {
      id: invitation.id,
      token: invitation.token,
      link,
      type: data.type,
      email: invitation.email ?? undefined,
      singleUse: invitation.singleUse,
      autoApproved: invitation.autoApproved,
      expiresAt: invitation.expiresAt,
    };
  }

  async listInvitations(actingUserId: string) {
    const companyId = await this.getCompanyIdForUser(actingUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true },
    });
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_HUNTZEN';
    const isAdminRH = user?.role === 'ADMIN_RH';
    if (!isSuperAdmin && !isAdminRH) {
      throw new ForbiddenException('Accès réservé aux administrateurs RH.');
    }
    const where: { companyId?: string; createdByUserId?: string } = { createdByUserId: actingUserId };
    if (companyId) where.companyId = companyId;

    const list = await this.prisma.invitation.findMany({
      where,
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return list.map((inv) => ({
      id: inv.id,
      token: inv.token,
      type: inv.singleUse ? 'unique' : 'shared',
      email: inv.email ?? undefined,
      singleUse: inv.singleUse,
      autoApproved: inv.autoApproved,
      expiresAt: inv.expiresAt,
      usedAt: inv.usedAt ?? undefined,
      companyName: inv.company.name,
      createdAt: inv.createdAt,
    }));
  }
}
