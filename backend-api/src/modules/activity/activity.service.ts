import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogActivityParams {
  actorUserId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
}

export interface GetActivityLogsParams {
  from?: Date;
  to?: Date;
  action?: string;
  actorUserId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogActivityParams): Promise<void> {
    const { actorUserId, action, entityType, entityId, details } = params;
    const user = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { email: true, role: true },
    });
    const actorEmail = user?.email ?? 'unknown';
    const actorRole = user?.role ?? 'UNKNOWN';
    await this.prisma.activityLog.create({
      data: {
        actorUserId,
        actorEmail,
        actorRole,
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        details: details ?? null,
      },
    });
  }

  async getActivityLogs(
    _requestingUserId: string,
    params: GetActivityLogsParams = {},
  ): Promise<{ items: any[]; total: number }> {
    const { from, to, action, actorUserId, page = 1, limit = 50 } = params;
    const skip = Math.max(0, (page - 1) * limit);

    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }
    if (action) where.action = action;
    if (actorUserId) where.actorUserId = actorUserId;

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.min(limit, 200),
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      items: items.map((row) => ({
        id: row.id,
        actorUserId: row.actorUserId,
        actorEmail: row.actorEmail,
        actorRole: row.actorRole,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        details: row.details,
        createdAt: row.createdAt,
      })),
      total,
    };
  }
}
