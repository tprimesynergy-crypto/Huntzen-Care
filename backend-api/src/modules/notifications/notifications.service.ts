import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markRead(userId: string, id: string) {
    const n = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!n) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getPreferences(userId: string) {
    const prefs = await this.prisma.userNotificationPreferences.findUnique({
      where: { userId },
    });
    return prefs ?? {
      notificationsEnabled: true,
      sessionReminderEnabled: true,
      newArticlesEnabled: true,
    };
  }

  async updatePreferences(
    userId: string,
    data: { notificationsEnabled?: boolean; sessionReminderEnabled?: boolean; newArticlesEnabled?: boolean },
  ) {
    return this.prisma.userNotificationPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async shouldReceiveNotification(userId: string): Promise<boolean> {
    const prefs = await this.prisma.userNotificationPreferences.findUnique({
      where: { userId },
    });
    return prefs?.notificationsEnabled ?? true;
  }

  async shouldReceiveSessionReminder(userId: string): Promise<boolean> {
    const prefs = await this.prisma.userNotificationPreferences.findUnique({
      where: { userId },
    });
    return (prefs?.notificationsEnabled ?? true) && (prefs?.sessionReminderEnabled ?? true);
  }

  async create(userId: string, type: NotificationType, title: string, message: string, linkUrl?: string, linkLabel?: string) {
    try {
      console.log('[NotificationsService] Creating notification:', { userId, type, title });
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          linkUrl,
          linkLabel,
          isRead: false,
        },
      });
      console.log('[NotificationsService] Notification created:', notification.id);
      return notification;
    } catch (error) {
      console.error('[NotificationsService] Error creating notification:', error);
      throw error;
    }
  }
}
