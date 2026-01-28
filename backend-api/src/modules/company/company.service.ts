import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getMyCompany(userId: string) {
    // 1) Try to resolve company via Employee (standard employee users)
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        company: true,
      },
    });
    if (employee?.company) {
      return employee.company;
    }

    // 2) Fallback for admins (e.g. ADMIN_RH) who have companyId directly on User
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (user?.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: user.companyId },
      });
      if (company) {
        return company;
      }
    }

    throw new NotFoundException('Company not found');
  }
}
