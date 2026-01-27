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

  private async ensureParticipant(consultationId: string, userId: string): Promise<{ role: Role; practitioner?: any; employee?: any }> {
    const c = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        practitioner: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        employee: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
    if (!c) throw new NotFoundException('Consultation not found');
    if (c.employee.user.id === userId)
      return { role: 'EMPLOYEE' as Role, employee: c.employee, practitioner: c.practitioner };
    if (c.practitioner.user.id === userId)
      return { role: 'PRACTITIONER' as Role, practitioner: c.practitioner, employee: c.employee };
    throw new NotFoundException('Not a participant');
  }

  async getConversations(userId: string, userRole: string) {
    const ids = await this.getConsultationIdsForUser(userId, userRole);
    if (ids.length === 0) return [];
    const consultations = await this.prisma.consultation.findMany({
      where: { id: { in: ids } },
      include: {
        practitioner: { include: { user: { select: { id: true, email: true } } } },
        employee: { include: { user: { select: { id: true, email: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    const isEmployee = userRole === 'EMPLOYEE';

    // Group conversations so there is only ONE per practitioner (for employees)
    // and ONE per employee (for practitioners), even if multiple consultations exist.
    const grouped = new Map<string, any>();

    consultations.forEach((c) => {
      const last = c.messages[0];
      const p = c.practitioner as { title?: string; firstName: string; lastName: string; specialty?: string };
      const e = c.employee as { firstName: string; lastName: string };
      const name = isEmployee
        ? `${p.title || ''} ${p.firstName} ${p.lastName}`.trim()
        : `${e.firstName} ${e.lastName}`;

      const key = isEmployee ? c.practitionerId : c.employeeId;
      const conversation = {
        id: c.id,
        consultationId: c.id,
        practitionerId: c.practitionerId,
        employeeId: c.employeeId,
        practitioner: isEmployee ? name : undefined,
        employee: !isEmployee ? name : undefined,
        specialty: isEmployee ? p.specialty : undefined,
        avatar: isEmployee
          ? `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase()
          : `${e.firstName?.[0] || ''}${e.lastName?.[0] || ''}`.toUpperCase(),
        lastMessage: last?.content ?? null,
        lastMessageTime: last?.createdAt ?? c.createdAt,
        unread: 0,
      };

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, conversation);
      } else {
        // Keep the most recent conversation based on lastMessageTime
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
}
