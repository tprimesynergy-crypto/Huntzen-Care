import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getMyCompany(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        company: true,
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee.company;
  }
}
