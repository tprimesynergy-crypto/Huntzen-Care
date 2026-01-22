import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mood } from '@prisma/client';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  private async getEmployeeId(userId: string): Promise<string> {
    const emp = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp.id;
  }

  async findAll(userId: string) {
    const employeeId = await this.getEmployeeId(userId);
    return this.prisma.journalEntry.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(userId: string) {
    const employeeId = await this.getEmployeeId(userId);
    const entries = await this.prisma.journalEntry.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
    const total = entries.length;
    const withMood = entries.filter((e) => e.mood != null);
    const moodOrder: Record<string, number> = {
      VERY_BAD: 1,
      BAD: 2,
      NEUTRAL: 3,
      GOOD: 4,
      VERY_GOOD: 5,
    };
    const avgMood =
      withMood.length > 0
        ? withMood.reduce((s, e) => s + (moodOrder[e.mood!] ?? 3), 0) / withMood.length
        : null;
    let streak = 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const seen = new Set<string>();
    for (const e of entries) {
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const ed = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.floor((today.getTime() - ed.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays !== streak) break;
      streak++;
    }
    return { total, avgMood: avgMood != null ? Math.round(avgMood * 10) / 10 : null, streak };
  }

  async create(
    userId: string,
    data: { content: string; mood?: Mood; tags?: string[] },
  ) {
    const employeeId = await this.getEmployeeId(userId);
    return this.prisma.journalEntry.create({
      data: {
        employeeId,
        content: data.content,
        mood: data.mood ?? undefined,
        tags: data.tags ?? [],
      },
    });
  }

  async delete(userId: string, id: string) {
    const employeeId = await this.getEmployeeId(userId);
    const e = await this.prisma.journalEntry.findFirst({
      where: { id, employeeId },
    });
    if (!e) throw new NotFoundException('Journal entry not found');
    await this.prisma.journalEntry.delete({ where: { id } });
    return { ok: true };
  }
}
