import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PractitionersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.practitioner.findMany({
      where: {
        isValidated: true,
        isActive: true,
        isAcceptingNewClients: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const practitioner = await this.prisma.practitioner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        availabilities: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!practitioner) {
      throw new NotFoundException('Practitioner not found');
    }

    return practitioner;
  }

  async getAvailability(practitionerId: string) {
    return this.prisma.availability.findMany({
      where: {
        practitionerId,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findMeByUserId(userId: string) {
    const p = await this.prisma.practitioner.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true } },
        availabilities: { where: { isActive: true } },
      },
    });
    if (!p) throw new NotFoundException('Practitioner not found');
    return p;
  }
}
