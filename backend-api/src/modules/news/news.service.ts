import { Injectable } from '@nestjs/common';
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
}
