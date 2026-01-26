import { Injectable, NotFoundException } from '@nestjs/common';
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
}
