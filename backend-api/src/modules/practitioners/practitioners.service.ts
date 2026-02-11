import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { Specialty } from '@prisma/client';

@Injectable()
export class PractitionersService {
  private readonly logger = new Logger(PractitionersService.name);

  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async findAll() {
    try {
      const list = await this.prisma.practitioner.findMany({
        where: {
          isValidated: true,
          isActive: true,
          isAcceptingNewClients: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          specialty: true,
          subSpecialties: true,
          languages: true,
          experience: true,
          avatarUrl: true,
          coverUrl: true,
          offersVideo: true,
          offersPhone: true,
          defaultDuration: true,
          timezone: true,
          isValidated: true,
          isActive: true,
          isAcceptingNewClients: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return list;
    } catch (err) {
      this.logger.error(`findAll failed: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined);
      throw err;
    }
  }

  async findOne(id: string) {
    const practitioner = await this.prisma.practitioner.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        title: true,
        professionalId: true,
        specialty: true,
        subSpecialties: true,
        languages: true,
        bio: true,
        experience: true,
        education: true,
        avatarUrl: true,
        coverUrl: true,
        offersVideo: true,
        offersPhone: true,
        isValidated: true,
        validatedAt: true,
        defaultDuration: true,
        timezone: true,
        isActive: true,
        isAcceptingNewClients: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        availabilities: {
          where: { isActive: true },
          select: {
            id: true,
            type: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            date: true,
            isAvailable: true,
            slotDuration: true,
            isActive: true,
          },
        },
      },
    });

    if (!practitioner) {
      throw new NotFoundException('Practitioner not found');
    }

    return practitioner;
  }

  async getAvailability(practitionerId: string) {
    return this.prisma.availability.findMany({
      where: {
        practitionerId,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findMeByUserId(userId: string) {
    const p = await this.prisma.practitioner.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true } },
        company: { select: { id: true, name: true } },
        availabilities: true,
      },
    });
    if (!p) throw new NotFoundException('Practitioner not found');
    return p;
  }

  async updateMe(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      title?: string;
      professionalId?: string | null;
      specialty?: Specialty;
      customSpecialty?: string | null;
      subSpecialties?: string[];
      languages?: string[];
      bio?: string;
      experience?: number | null;
      education?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
      offersVideo?: boolean;
      offersPhone?: boolean;
      defaultDuration?: number;
      timezone?: string;
      isActive?: boolean;
      isAcceptingNewClients?: boolean;
      companyId?: string | null;
    },
  ) {
    const p = await this.prisma.practitioner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Practitioner not found');

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.professionalId !== undefined) updateData.professionalId = data.professionalId;
    if (data.specialty !== undefined) updateData.specialty = data.specialty;
    if (data.customSpecialty !== undefined) updateData.customSpecialty = data.customSpecialty;
    if (data.subSpecialties !== undefined) updateData.subSpecialties = data.subSpecialties;
    if (data.languages !== undefined) updateData.languages = data.languages;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.experience !== undefined) updateData.experience = data.experience;
    if (data.education !== undefined) updateData.education = data.education;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
    if (data.offersVideo !== undefined) updateData.offersVideo = data.offersVideo;
    if (data.offersPhone !== undefined) updateData.offersPhone = data.offersPhone;
    if (data.defaultDuration !== undefined) updateData.defaultDuration = data.defaultDuration;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isAcceptingNewClients !== undefined) updateData.isAcceptingNewClients = data.isAcceptingNewClients;
    if (data.companyId !== undefined) updateData.companyId = data.companyId;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.practitioner.update({
        where: { id: p.id },
        data: updateData,
      });
      this.activityService.log({
        actorUserId: userId,
        action: 'PRACTITIONER_PROFILE_UPDATE',
        entityType: 'practitioner',
        entityId: p.id,
        details: undefined,
      }).catch(() => {});
    }
    return { ok: true };
  }

  async getMyAvailability(userId: string) {
    const p = await this.prisma.practitioner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Practitioner not found');
    return this.prisma.availability.findMany({
      where: { practitionerId: p.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createMyAvailability(
    userId: string,
    data: {
      type?: 'RECURRING' | 'EXCEPTION';
      dayOfWeek?: number | null;
      startTime?: string | null;
      endTime?: string | null;
      date?: Date | null;
      isAvailable?: boolean;
      slotDuration?: number;
    },
  ) {
    const p = await this.prisma.practitioner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Practitioner not found');
    const created = await this.prisma.availability.create({
      data: {
        practitionerId: p.id,
        type: (data.type as any) ?? 'RECURRING',
        dayOfWeek: data.dayOfWeek ?? null,
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        date: data.date ?? null,
        isAvailable: data.isAvailable !== false,
        slotDuration: data.slotDuration ?? 50,
        isActive: true,
      },
    });
    return created;
  }

  async updateMyAvailability(
    userId: string,
    availabilityId: string,
    data: {
      type?: 'RECURRING' | 'EXCEPTION';
      dayOfWeek?: number | null;
      startTime?: string | null;
      endTime?: string | null;
      date?: Date | null;
      isAvailable?: boolean;
      slotDuration?: number;
      isActive?: boolean;
    },
  ) {
    const p = await this.prisma.practitioner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Practitioner not found');
    const av = await this.prisma.availability.findFirst({
      where: { id: availabilityId, practitionerId: p.id },
    });
    if (!av) throw new NotFoundException('Availability not found');
    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.slotDuration !== undefined) updateData.slotDuration = data.slotDuration;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    await this.prisma.availability.update({
      where: { id: availabilityId },
      data: updateData,
    });
    this.activityService.log({
      actorUserId: userId,
      action: 'AVAILABILITY_UPDATE',
      entityType: 'availability',
      entityId: availabilityId,
      details: undefined,
    }).catch(() => {});
    return { ok: true };
  }

  async deleteMyAvailability(userId: string, availabilityId: string) {
    const p = await this.prisma.practitioner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Practitioner not found');
    const av = await this.prisma.availability.findFirst({
      where: { id: availabilityId, practitionerId: p.id },
    });
    if (!av) throw new NotFoundException('Availability not found');
    await this.prisma.availability.delete({ where: { id: availabilityId } });
    this.activityService.log({
      actorUserId: userId,
      action: 'AVAILABILITY_DELETE',
      entityType: 'availability',
      entityId: availabilityId,
      details: undefined,
    }).catch(() => {});
    return { ok: true };
  }
}
