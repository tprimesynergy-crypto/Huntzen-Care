import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsultationFormat } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateConsultationDto) {
    // Generate room name
    const roomName = `huntzen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const consultation = await this.prisma.consultation.create({
      data: {
        companyId: dto.companyId,
        employeeId: dto.employeeId,
        practitionerId: dto.practitionerId,
        scheduledAt: new Date(dto.scheduledAt),
        scheduledEndAt: new Date(dto.scheduledEndAt),
        duration: dto.duration || 50,
        format: (dto.format as ConsultationFormat) || ConsultationFormat.VIDEO,
        status: 'SCHEDULED',
        roomName,
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        practitioner: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return consultation;
  }

  async findAll(userId: string, userRole: string, companyId?: string) {
    const where: any = {};

    if (userRole === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findUnique({
        where: { userId },
      });
      if (employee) {
        where.employeeId = employee.id;
      }
    } else if (userRole === 'PRACTITIONER') {
      const practitioner = await this.prisma.practitioner.findUnique({
        where: { userId },
      });
      if (practitioner) {
        where.practitionerId = practitioner.id;
      }
    }

    if (companyId) {
      where.companyId = companyId;
    }

    return this.prisma.consultation.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        practitioner: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        practitioner: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    // Check access
    if (userRole === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findUnique({
        where: { userId },
      });
      if (employee && consultation.employeeId !== employee.id) {
        throw new NotFoundException('Consultation not found');
      }
    } else if (userRole === 'PRACTITIONER') {
      const practitioner = await this.prisma.practitioner.findUnique({
        where: { userId },
      });
      if (practitioner && consultation.practitionerId !== practitioner.id) {
        throw new NotFoundException('Consultation not found');
      }
    }

    return consultation;
  }

  async cancel(id: string, userId: string, userRole: string) {
    const consultation = await this.findOne(id, userId, userRole);
    if (consultation.status === 'CANCELLED') {
      return consultation;
    }
    return this.prisma.consultation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        employee: { include: { user: { select: { id: true, email: true } } } },
        practitioner: { include: { user: { select: { id: true, email: true } } } },
      },
    });
  }
}
