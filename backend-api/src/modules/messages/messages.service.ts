import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  private async getConsultationIdsForUser(userId: string, role: string): Promise<string[]> {
    const where: any = {};
    if (role === 'EMPLOYEE') {
      const emp = await this.prisma.employee.findUnique({ where: { userId } });
      if (!emp) return [];
      where.employeeId = emp.id;
    } else if (role === 'PRACTITIONER') {
      const prac = await this.prisma.practitioner.findUnique({ where: { userId } });
      if (!prac) return [];
      where.practitionerId = prac.id;
    } else return [];
    const list = await this.prisma.consultation.findMany({
      where,
      select: { id: true },
    });
    return list.map((c) => c.id);
  }

  private async ensureParticipant(consultationId: string, userId: string): Promise<{ role: Role }> {
    const c = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      select: {
        employee: { select: { userId: true } },
        practitioner: { select: { userId: true } },
      },
    });
    if (!c) throw new NotFoundException('Consultation not found');
    if (c.employee?.userId === userId) return { role: 'EMPLOYEE' as Role };
    if (c.practitioner?.userId === userId) return { role: 'PRACTITIONER' as Role };
    throw new NotFoundException('Not a participant');
  }

  async getConversations(userId: string, userRole: string) {
    const ids = await this.getConsultationIdsForUser(userId, userRole);
    if (ids.length === 0) return [];
    const consultations = await this.prisma.consultation.findMany({
      where: { id: { in: ids } },
      include: {
        practitioner: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            specialty: true,
            user: { select: { id: true, email: true } },
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { id: true, email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    const isEmployee = userRole === 'EMPLOYEE';

    const grouped = new Map<string, any>();

    consultations.forEach((c) => {
      const last = c.messages[0];
      const p = c.practitioner as { title?: string; firstName: string; lastName: string; specialty?: string } | null;
      const e = c.employee as { firstName: string; lastName: string } | null;
      const name = isEmployee
        ? (p ? `${p.title || ''} ${p.firstName} ${p.lastName}`.trim() : 'Praticien')
        : (e ? `${e.firstName} ${e.lastName}` : 'Employé');

      const key = isEmployee ? c.practitionerId : c.employeeId;
      const conversation = {
        id: c.id,
        consultationId: c.id,
        practitionerId: c.practitionerId,
        employeeId: c.employeeId,
        practitioner: isEmployee ? name : undefined,
        employee: !isEmployee ? name : undefined,
        specialty: isEmployee && p ? p.specialty : undefined,
        avatar: isEmployee
          ? (p ? `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase() : '?')
          : (e ? `${e.firstName?.[0] || ''}${e.lastName?.[0] || ''}`.toUpperCase() : '?'),
        lastMessage: last?.content ?? null,
        lastMessageTime: last?.createdAt ?? c.createdAt,
        unread: 0,
      };

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, conversation);
      } else {
        const existingTime = new Date(existing.lastMessageTime).getTime();
        const currentTime = new Date(conversation.lastMessageTime).getTime();
        if (currentTime > existingTime) {
          grouped.set(key, conversation);
        }
      }
    });

    return Array.from(grouped.values());
  }

  async getByConsultation(consultationId: string, userId: string) {
    await this.ensureParticipant(consultationId, userId);
    const msgs = await this.prisma.message.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'asc' },
    });
    const emp = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { employee: { select: { userId: true } } },
    });
    const employeeUserId = emp?.employee.userId;
    return msgs.map((m) => ({
      id: m.id,
      sender: m.senderId === userId ? 'me' : 'other',
      senderRole: m.senderRole,
      content: m.content,
      time: m.createdAt,
      isRead: m.isRead,
    }));
  }

  async send(consultationId: string, userId: string, content: string) {
    const { role } = await this.ensureParticipant(consultationId, userId);
    return this.prisma.message.create({
      data: {
        consultationId,
        senderId: userId,
        senderRole: role,
        content,
      },
    });
  }

  /**
   * For employees: find or create a consultation with a practitioner to enable messaging.
   * Returns the consultation id so the first message can be sent.
   */
  async startOrGetConversation(userId: string, practitionerId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      select: { id: true, companyId: true },
    });
    if (!employee) {
      throw new NotFoundException('Employé introuvable.');
    }
    if (!employee.companyId) {
      throw new NotFoundException('Vous devez être rattaché à une entreprise pour envoyer des messages.');
    }
    const existing = await this.prisma.consultation.findFirst({
      where: {
        employeeId: employee.id,
        practitionerId,
      },
      select: { id: true },
    });
    if (existing) {
      return { consultationId: existing.id };
    }
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 1);
    const farFutureEnd = new Date(farFuture);
    farFutureEnd.setMinutes(farFutureEnd.getMinutes() + 50);
    const roomName = `huntzen-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const consultation = await this.prisma.consultation.create({
      data: {
        companyId: employee.companyId,
        employeeId: employee.id,
        practitionerId,
        scheduledAt: farFuture,
        scheduledEndAt: farFutureEnd,
        duration: 50,
        format: 'VIDEO',
        status: 'SCHEDULED',
        roomName,
      },
      select: { id: true },
    });
    return { consultationId: consultation.id };
  }
}
