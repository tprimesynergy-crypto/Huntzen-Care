import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  /** All users: list all articles (platform-wide). */
  async findAll() {
    return this.prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });
  }

  /** All users: get one article by id (increments viewCount). */
  async findOne(id: string) {
    const article = await this.prisma.news.findUnique({
      where: { id },
    });
    if (!article) throw new NotFoundException('Article not found');
    await this.prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return this.prisma.news.findUnique({
      where: { id },
    });
  }

  /** ADMIN_HUNTZEN & SUPER_ADMIN only: create article. */
  async create(
    userId: string,
    data: {
      title: string;
      content: string;
      imageUrl?: string | null;
      companyId?: string | null;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });
    if (!user || (user.role !== Role.ADMIN_HUNTZEN && user.role !== Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Seuls Admin HuntZen et Super Admin peuvent créer des articles.');
    }
    const authorName = user.email || 'HuntZen';
    return this.prisma.news.create({
      data: {
        title: data.title.trim(),
        content: data.content.trim(),
        imageUrl: data.imageUrl?.trim() || null,
        companyId: data.companyId || null,
        authorId: userId,
        authorName,
      },
    });
  }

  /** ADMIN_HUNTZEN & SUPER_ADMIN only: update article. */
  async update(
    id: string,
    userId: string,
    data: { title?: string; content?: string; imageUrl?: string | null },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || (user.role !== Role.ADMIN_HUNTZEN && user.role !== Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Seuls Admin HuntZen et Super Admin peuvent modifier des articles.');
    }
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Article not found');
    return this.prisma.news.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.content !== undefined && { content: data.content.trim() }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl?.trim() || null }),
      },
    });
  }

  /** ADMIN_HUNTZEN & SUPER_ADMIN only: delete article. */
  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || (user.role !== Role.ADMIN_HUNTZEN && user.role !== Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Seuls Admin HuntZen et Super Admin peuvent supprimer des articles.');
    }
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Article not found');
    await this.prisma.news.delete({ where: { id } });
    return { ok: true };
  }
}
