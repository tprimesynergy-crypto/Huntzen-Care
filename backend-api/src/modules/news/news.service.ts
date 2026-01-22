import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string | null) {
    if (!companyId) {
      return [];
    }
    return this.prisma.news.findMany({
      where: { companyId },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
  }

  async findOne(id: string, companyId: string | null) {
    const where: { id: string; companyId?: string } = { id };
    if (companyId) where.companyId = companyId;
    const article = await this.prisma.news.findFirst({ where });
    if (!article) throw new NotFoundException('Article not found');
    return this.prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
}
