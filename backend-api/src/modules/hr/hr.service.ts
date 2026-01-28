import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HRService {
  constructor(private prisma: PrismaService) {}

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

    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
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
        practitioner: true,
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
}
