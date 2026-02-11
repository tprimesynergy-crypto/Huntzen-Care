import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmergencyService {
  constructor(private prisma: PrismaService) {}

  async getPublic() {
    const [contacts, resources] = await Promise.all([
      this.prisma.emergencyContact.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.emergencyOnlineResource.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);
    return { contacts, resources };
  }

  private async ensureAdminHuntzen(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_HUNTZEN')) {
      throw new ForbiddenException('Accès réservé aux administrateurs HuntZen.');
    }
  }

  async getContacts(userId: string) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyContact.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createContact(userId: string, data: { name: string; number: string; available?: string; sortOrder?: number }) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyContact.create({
      data: {
        name: data.name.trim(),
        number: data.number.trim(),
        available: data.available?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateContact(
    userId: string,
    id: string,
    data: { name?: string; number?: string; available?: string; sortOrder?: number },
  ) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyContact.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.number !== undefined && { number: data.number.trim() }),
        ...(data.available !== undefined && { available: data.available?.trim() || null }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
  }

  async deleteContact(userId: string, id: string) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyContact.delete({ where: { id } });
  }

  async getResources(userId: string) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyOnlineResource.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createResource(
    userId: string,
    data: { name: string; description?: string; url: string; sortOrder?: number },
  ) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyOnlineResource.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        url: data.url.trim(),
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateResource(
    userId: string,
    id: string,
    data: { name?: string; description?: string; url?: string; sortOrder?: number },
  ) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyOnlineResource.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.url !== undefined && { url: data.url.trim() }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
  }

  async deleteResource(userId: string, id: string) {
    await this.ensureAdminHuntzen(userId);
    return this.prisma.emergencyOnlineResource.delete({ where: { id } });
  }
}
