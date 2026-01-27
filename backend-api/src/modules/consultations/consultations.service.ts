import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsultationFormat, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

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

  async reschedule(
    id: string,
    userId: string,
    userRole: string,
    dto: { scheduledAt: string; scheduledEndAt: string },
  ) {
    const consultation = await this.findOne(id, userId, userRole);
    if (consultation.status === 'CANCELLED') {
      throw new NotFoundException('Cannot reschedule a cancelled consultation');
    }
    const duration =
      (new Date(dto.scheduledEndAt).getTime() - new Date(dto.scheduledAt).getTime()) / (60 * 1000);
    
    const updatedConsultation = await this.prisma.consultation.update({
      where: { id },
      data: {
        scheduledAt: new Date(dto.scheduledAt),
        scheduledEndAt: new Date(dto.scheduledEndAt),
        duration: Math.round(duration),
      },
      include: {
        employee: { include: { user: { select: { id: true, email: true } } } },
        practitioner: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    // Send notification to the other party (non-blocking - don't fail if notification fails)
    try {
      const newDate = new Date(dto.scheduledAt);
      const formattedDate = newDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      const formattedTime = newDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      if (userRole === 'EMPLOYEE') {
        // Employee rescheduled → notify practitioner
        const practitionerUserId = updatedConsultation.practitioner?.user?.id;
        console.log('[Reschedule] Employee rescheduled, practitionerUserId:', practitionerUserId);
        console.log('[Reschedule] Updated consultation:', JSON.stringify(updatedConsultation, null, 2));
        
        if (practitionerUserId) {
          const employeeName = updatedConsultation.employee 
            ? `${updatedConsultation.employee.firstName} ${updatedConsultation.employee.lastName}`
            : 'Un patient';
          
          console.log('[Reschedule] Creating notification for practitioner:', practitionerUserId);
          const notification =           await this.notificationsService.create(
            practitionerUserId,
            NotificationType.CONSULTATION_RESCHEDULED,
            'Consultation reprogrammée',
            `${employeeName} a reprogrammé votre consultation au ${formattedDate} à ${formattedTime}.`,
            `/consultations/${id}`,
            'Voir la consultation'
          );
          console.log('[Reschedule] Notification created successfully:', notification.id);
        } else {
          console.warn('[Reschedule] No practitioner user ID found in consultation');
        }
      } else if (userRole === 'PRACTITIONER') {
        // Practitioner rescheduled → notify employee
        const employeeUserId = updatedConsultation.employee?.user?.id;
        console.log('[Reschedule] Practitioner rescheduled, employeeUserId:', employeeUserId);
        console.log('[Reschedule] Updated consultation:', JSON.stringify(updatedConsultation, null, 2));
        
        if (employeeUserId) {
          const practitionerName = updatedConsultation.practitioner
            ? `${updatedConsultation.practitioner.title || ''} ${updatedConsultation.practitioner.firstName} ${updatedConsultation.practitioner.lastName}`.trim()
            : 'Votre praticien';
          
          console.log('[Reschedule] Creating notification for employee:', employeeUserId);
          const notification =           await this.notificationsService.create(
            employeeUserId,
            NotificationType.CONSULTATION_RESCHEDULED,
            'Consultation reprogrammée',
            `${practitionerName} a reprogrammé votre consultation au ${formattedDate} à ${formattedTime}.`,
            `/consultations/${id}`,
            'Voir la consultation'
          );
          console.log('[Reschedule] Notification created successfully:', notification.id);
        } else {
          console.warn('[Reschedule] No employee user ID found in consultation');
        }
      } else {
        console.warn('[Reschedule] Unknown user role:', userRole);
      }
    } catch (error) {
      // Log error but don't fail the reschedule operation
      console.error('[Reschedule] Failed to create reschedule notification:', error);
      console.error('[Reschedule] Error details:', error instanceof Error ? error.message : String(error));
      console.error('[Reschedule] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // The consultation was already updated successfully, so we continue
    }

    return updatedConsultation;
  }
}
