import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async updateMe(userId: string, dto: { firstName?: string; lastName?: string; department?: string; position?: string; phoneNumber?: string; bio?: string; avatarUrl?: string; coverUrl?: string }) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const data: Record<string, unknown> = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.department !== undefined) data.department = dto.department;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.phoneNumber !== undefined) data.phoneNumber = dto.phoneNumber;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.coverUrl !== undefined) data.coverUrl = dto.coverUrl;

    const updated = await this.prisma.employee.update({
      where: { id: employee.id },
      data,
      include: {
        user: { select: { id: true, email: true, role: true } },
        company: { select: { id: true, name: true, slug: true } },
      },
    });
    return updated;
  }

  async getFavoritePractitioners(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const favorites = await this.prisma.favoritePractitioner.findMany({
      where: { employeeId: employee.id },
      select: { practitionerId: true },
    });

    return favorites.map((f) => f.practitionerId);
  }

  async addFavoritePractitioner(userId: string, practitionerId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.favoritePractitioner.upsert({
      where: {
        employeeId_practitionerId: {
          employeeId: employee.id,
          practitionerId,
        },
      },
      update: {},
      create: {
        employeeId: employee.id,
        practitionerId,
      },
    });

    return { ok: true };
  }

  async removeFavoritePractitioner(userId: string, practitionerId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.favoritePractitioner.deleteMany({
      where: {
        employeeId: employee.id,
        practitionerId,
      },
    });

    return { ok: true };
  }
}
