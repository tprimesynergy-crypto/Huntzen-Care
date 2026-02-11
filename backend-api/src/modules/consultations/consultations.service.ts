import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConsultationFormat, ConsultationStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private activityService: ActivityService,
  ) {}

  async create(userId: string, dto: CreateConsultationDto) {
    const start = new Date(dto.scheduledAt);
    const end = new Date(dto.scheduledEndAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new BadRequestException('Plage horaire invalide pour la consultation.');
    }

    // Check that the practitioner is available (no overlapping consultation)
    const overlapping = await this.prisma.consultation.findFirst({
      where: {
        practitionerId: dto.practitionerId,
        status: { not: 'CANCELLED' },
        // Overlap condition: existing.start < newEnd AND existing.end > newStart
        scheduledAt: { lt: end },
        scheduledEndAt: { gt: start },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Le praticien n’est pas disponible à cet horaire. Merci de choisir un autre créneau.',
      );
    }

    // Generate room name
    const roomName = `huntzen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const consultation = await this.prisma.consultation.create({
      data: {
        companyId: dto.companyId,
        employeeId: dto.employeeId,
        practitionerId: dto.practitionerId,
        scheduledAt: start,
        scheduledEndAt: end,
        duration: dto.duration || 50,
        format: (dto.format as ConsultationFormat) || ConsultationFormat.VIDEO,
        status: ConsultationStatus.SCHEDULED,
        roomName,
      },
      select: {
        id: true,
        companyId: true,
        employeeId: true,
        practitionerId: true,
        scheduledAt: true,
        scheduledEndAt: true,
        duration: true,
        format: true,
        status: true,
        roomName: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { id: true, email: true } },
          },
        },
        practitioner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    // Notify practitioner that a new consultation has been requested (non-blocking)
    try {
      const practitionerUserId = consultation.practitioner?.user?.id;
      if (practitionerUserId) {
        const employeeName = consultation.employee
          ? `${consultation.employee.firstName} ${consultation.employee.lastName}`
          : 'Un patient';

        const formattedDate = consultation.scheduledAt.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const formattedTime = consultation.scheduledAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await this.notificationsService.create(
          practitionerUserId,
          NotificationType.SYSTEM,
          'Nouvelle demande de consultation',
          `${employeeName} a demandé une nouvelle consultation le ${formattedDate} à ${formattedTime}.`,
          `/consultations/${consultation.id}`,
          'Voir la consultation',
        );
      }
    } catch (error) {
      // Log but do not fail the booking
      console.error('[ConsultationsService.create] Failed to create notification:', error);
    }

    this.activityService.log({
      actorUserId: userId,
      action: 'CONSULTATION_CREATE',
      entityType: 'consultation',
      entityId: consultation.id,
      details: `${consultation.practitioner?.firstName ?? ''} ${consultation.practitioner?.lastName ?? ''}`.trim() || dto.practitionerId,
    }).catch(() => {});

    return consultation;
  }

  /** Set CONFIRMED consultations whose end time has passed to COMPLETED. */
  private async autoCompletePastConfirmed(): Promise<void> {
    await this.prisma.consultation.updateMany({
      where: {
        status: ConsultationStatus.CONFIRMED,
        scheduledEndAt: { lt: new Date() },
      },
      data: { status: ConsultationStatus.COMPLETED },
    });
  }

  async findAll(userId: string, userRole: string, companyId?: string) {
    await this.autoCompletePastConfirmed();

    const where: Record<string, unknown> = {};

    if (userRole === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!employee) {
        return [];
      }
      where.employeeId = employee.id;
    } else if (userRole === 'PRACTITIONER') {
      const practitioner = await this.prisma.practitioner.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!practitioner) {
        return [];
      }
      where.practitionerId = practitioner.id;
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            userId: true,
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
    await this.autoCompletePastConfirmed();

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
    if (consultation.status === ConsultationStatus.CANCELLED) {
      return consultation;
    }
    const updated = await this.prisma.consultation.update({
      where: { id },
      data: { status: ConsultationStatus.CANCELLED },
      include: {
        employee: { include: { user: { select: { id: true, email: true } } } },
        practitioner: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    this.activityService.log({
      actorUserId: userId,
      action: 'CONSULTATION_CANCEL',
      entityType: 'consultation',
      entityId: id,
      details: undefined,
    }).catch(() => {});

    // Send notification to the other party about the cancellation (non-blocking)
    try {
      const formattedDate = updated.scheduledAt.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const formattedTime = updated.scheduledAt.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (userRole === 'EMPLOYEE') {
        // Employee cancelled → notify practitioner
        const practitionerUserId = updated.practitioner?.user?.id;
        if (practitionerUserId) {
          const employeeName = updated.employee
            ? `${updated.employee.firstName} ${updated.employee.lastName}`
            : 'Un patient';

          await this.notificationsService.create(
            practitionerUserId,
            NotificationType.CONSULTATION_CANCELLED,
            'Consultation annulée',
            `${employeeName} a annulé la consultation prévue le ${formattedDate} à ${formattedTime}.`,
            `/consultations/${updated.id}`,
            'Voir la consultation',
          );
        }
      } else if (userRole === 'PRACTITIONER') {
        // Practitioner cancelled → notify employee
        const employeeUserId = updated.employee?.user?.id;
        if (employeeUserId) {
          const practitionerName = updated.practitioner
            ? `${updated.practitioner.title || ''} ${updated.practitioner.firstName} ${updated.practitioner.lastName}`.trim()
            : 'Votre praticien';

          await this.notificationsService.create(
            employeeUserId,
            NotificationType.CONSULTATION_CANCELLED,
            'Consultation annulée',
            `${practitionerName} a annulé votre consultation du ${formattedDate} à ${formattedTime}.`,
            `/consultations/${updated.id}`,
            'Voir la consultation',
          );
        }
      } else {
        // Other roles (e.g. admin) - optionally notify both parties
        const employeeUserId = updated.employee?.user?.id;
        const practitionerUserId = updated.practitioner?.user?.id;
        const practitionerName = updated.practitioner
          ? `${updated.practitioner.title || ''} ${updated.practitioner.firstName} ${updated.practitioner.lastName}`.trim()
          : 'Le praticien';
        const employeeName = updated.employee
          ? `${updated.employee.firstName} ${updated.employee.lastName}`
          : 'Le patient';

        if (employeeUserId) {
          await this.notificationsService.create(
            employeeUserId,
            NotificationType.CONSULTATION_CANCELLED,
            'Consultation annulée',
            `Votre consultation avec ${practitionerName} du ${formattedDate} à ${formattedTime} a été annulée.`,
            `/consultations/${updated.id}`,
            'Voir la consultation',
          );
        }
        if (practitionerUserId) {
          await this.notificationsService.create(
            practitionerUserId,
            NotificationType.CONSULTATION_CANCELLED,
            'Consultation annulée',
            `La consultation avec ${employeeName} du ${formattedDate} à ${formattedTime} a été annulée.`,
            `/consultations/${updated.id}`,
            'Voir la consultation',
          );
        }
      }
    } catch (error) {
      // Log but do not fail the cancellation
      console.error('[ConsultationsService.cancel] Failed to create cancellation notification:', error);
    }

    return updated;
  }

  async confirm(id: string, userId: string, userRole: string) {
    const consultation = await this.findOne(id, userId, userRole);

    if (userRole !== 'PRACTITIONER') {
      throw new ForbiddenException('Only practitioners can confirm consultations');
    }

    if (consultation.status === ConsultationStatus.CANCELLED) {
      throw new BadRequestException('Cannot confirm a cancelled consultation');
    }

    if (consultation.status === ConsultationStatus.CONFIRMED) {
      return consultation;
    }

    const updated = await this.prisma.consultation.update({
      where: { id },
      data: { status: ConsultationStatus.CONFIRMED },
      include: {
        employee: { include: { user: { select: { id: true, email: true } } } },
        practitioner: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    // Notify employee that the consultation has been confirmed
    try {
      const employeeUserId = updated.employee?.user?.id;
      if (employeeUserId) {
        const practitionerName = updated.practitioner
          ? `${updated.practitioner.title || ''} ${updated.practitioner.firstName} ${updated.practitioner.lastName}`.trim()
          : 'Votre praticien';

        const formattedDate = updated.scheduledAt.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const formattedTime = updated.scheduledAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await this.notificationsService.create(
          employeeUserId,
          NotificationType.CONSULTATION_CONFIRMED,
          'Consultation confirmée',
          `${practitionerName} a confirmé votre consultation du ${formattedDate} à ${formattedTime}.`,
          `/consultations/${updated.id}`,
          'Voir la consultation',
        );
      }
    } catch (error) {
      console.error('[ConsultationsService.confirm] Failed to create confirmation notification:', error);
    }

    this.activityService.log({
      actorUserId: userId,
      action: 'CONSULTATION_CONFIRM',
      entityType: 'consultation',
      entityId: id,
      details: undefined,
    }).catch(() => {});

    return updated;
  }

  async complete(id: string, userId: string, userRole: string) {
    const consultation = await this.findOne(id, userId, userRole);

    if (userRole !== 'PRACTITIONER') {
      throw new ForbiddenException('Seul le praticien peut marquer une consultation comme terminée');
    }

    if (consultation.status === ConsultationStatus.CANCELLED) {
      throw new BadRequestException('Impossible de clôturer une consultation annulée');
    }

    if (consultation.status === ConsultationStatus.COMPLETED) {
      return consultation;
    }

    const updated = await this.prisma.consultation.update({
      where: { id },
      data: { status: ConsultationStatus.COMPLETED },
      include: {
        employee: { include: { user: { select: { id: true, email: true } } } },
        practitioner: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    return updated;
  }

  async reschedule(
    id: string,
    userId: string,
    userRole: string,
    dto: { scheduledAt: string; scheduledEndAt: string },
  ) {
    const consultation = await this.findOne(id, userId, userRole);
    if (consultation.status === ConsultationStatus.CANCELLED) {
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

    this.activityService.log({
      actorUserId: userId,
      action: 'CONSULTATION_RESCHEDULE',
      entityType: 'consultation',
      entityId: id,
      details: dto.scheduledAt,
    }).catch(() => {});

    return updatedConsultation;
  }
}
