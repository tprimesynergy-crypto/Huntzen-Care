import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    consultationId: string,
    rating: number,
    comment?: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('La note doit être entre 1 et 5.');
    }
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      select: {
        id: true,
        status: true,
        employee: { select: { userId: true } },
        practitioner: { select: { userId: true } },
      },
    });
    if (!consultation) {
      throw new NotFoundException('Consultation introuvable.');
    }
    if (consultation.status !== 'COMPLETED') {
      throw new BadRequestException('Seules les consultations terminées peuvent être notées.');
    }
    const isEmployee = consultation.employee?.userId === userId;
    const isPractitioner = consultation.practitioner?.userId === userId;
    if (!isEmployee && !isPractitioner) {
      throw new ForbiddenException('Vous ne pouvez noter que vos propres consultations.');
    }
    const raterRole = isEmployee ? 'EMPLOYEE' : 'PRACTITIONER';
    const existing = await this.prisma.consultationRating.findUnique({
      where: {
        consultationId_raterRole: { consultationId, raterRole },
      },
    });
    if (existing) {
      return this.prisma.consultationRating.update({
        where: { id: existing.id },
        data: { rating, comment: comment ?? null },
      });
    }
    return this.prisma.consultationRating.create({
      data: {
        consultationId,
        raterRole,
        rating,
        comment: comment ?? null,
      },
    });
  }

  async getMyRatings(userId: string, userRole: string) {
    const where: any = { raterRole: userRole };
    if (userRole === 'EMPLOYEE') {
      const emp = await this.prisma.employee.findUnique({ where: { userId }, select: { id: true } });
      if (!emp) return [];
      where.consultation = { employeeId: emp.id };
    } else if (userRole === 'PRACTITIONER') {
      const prac = await this.prisma.practitioner.findUnique({ where: { userId }, select: { id: true } });
      if (!prac) return [];
      where.consultation = { practitionerId: prac.id };
    } else {
      return [];
    }
    return this.prisma.consultationRating.findMany({
      where,
      include: {
        consultation: {
          select: {
            id: true,
            scheduledAt: true,
            employee: { select: { firstName: true, lastName: true } },
            practitioner: { select: { firstName: true, lastName: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getStats(userId: string, userRole: string) {
    if (userRole === 'EMPLOYEE') {
      const emp = await this.prisma.employee.findUnique({ where: { userId }, select: { id: true } });
      if (!emp) return { avgReceived: null, countReceived: 0, avgGiven: null, countGiven: 0 };
      const received = await this.prisma.consultationRating.aggregate({
        where: {
          consultation: { employeeId: emp.id },
          raterRole: 'PRACTITIONER',
        },
        _avg: { rating: true },
        _count: true,
      });
      const given = await this.prisma.consultationRating.aggregate({
        where: {
          consultation: { employeeId: emp.id },
          raterRole: 'EMPLOYEE',
        },
        _avg: { rating: true },
        _count: true,
      });
      return {
        avgReceived: received._avg.rating,
        countReceived: received._count,
        avgGiven: given._avg.rating,
        countGiven: given._count,
      };
    }
    if (userRole === 'PRACTITIONER') {
      const prac = await this.prisma.practitioner.findUnique({ where: { userId }, select: { id: true } });
      if (!prac) return { avgReceived: null, countReceived: 0, avgGiven: null, countGiven: 0 };
      const received = await this.prisma.consultationRating.aggregate({
        where: {
          consultation: { practitionerId: prac.id },
          raterRole: 'EMPLOYEE',
        },
        _avg: { rating: true },
        _count: true,
      });
      const given = await this.prisma.consultationRating.aggregate({
        where: {
          consultation: { practitionerId: prac.id },
          raterRole: 'PRACTITIONER',
        },
        _avg: { rating: true },
        _count: true,
      });
      return {
        avgReceived: received._avg.rating,
        countReceived: received._count,
        avgGiven: given._avg.rating,
        countGiven: given._count,
      };
    }
    return { avgReceived: null, countReceived: 0, avgGiven: null, countGiven: 0 };
  }

  async getRatingsByConsultation(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      select: {
        employee: { select: { userId: true } },
        practitioner: { select: { userId: true } },
      },
    });
    if (!consultation) throw new NotFoundException('Consultation introuvable.');
    const isParticipant =
      consultation.employee?.userId === userId || consultation.practitioner?.userId === userId;
    if (!isParticipant) throw new ForbiddenException('Accès non autorisé.');
    return this.prisma.consultationRating.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
