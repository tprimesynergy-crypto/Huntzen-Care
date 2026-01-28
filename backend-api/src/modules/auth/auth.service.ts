import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: (dto.role as Role) || Role.EMPLOYEE,
        companyId: dto.companyId,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }).catch((err) => {
        this.logger.warn(`lastLoginAt update failed for ${user.id}: ${err instanceof Error ? err.message : err}`);
      });

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error(`Login failed for ${dto.email}: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Une erreur est survenue lors de la connexion.');
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Optionally load admin profile data for admin roles
    let adminProfile: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
      position: string | null;
    } | null = null;

    if (
      user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN_HUNTZEN' ||
      user.role === 'ADMIN_RH'
    ) {
      adminProfile = await this.prisma.adminProfile.findUnique({
        where: { userId: user.id },
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          position: true,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      firstName: adminProfile?.firstName ?? null,
      lastName: adminProfile?.lastName ?? null,
      phoneNumber: adminProfile?.phoneNumber ?? null,
      position: adminProfile?.position ?? null,
    };
  }

  async updateMe(
    userId: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      position?: string;
    },
  ) {
    // Load user to know their role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    // Update basic user fields (email)
    const userUpdates: any = {};
    if (data.email && data.email.trim()) {
      userUpdates.email = data.email.trim();
    }

    if (Object.keys(userUpdates).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    // For admin roles, also upsert AdminProfile with personal info
    if (
      user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN_HUNTZEN' ||
      user.role === 'ADMIN_RH'
    ) {
      const profileData: any = {};
      if (data.firstName !== undefined) profileData.firstName = data.firstName || null;
      if (data.lastName !== undefined) profileData.lastName = data.lastName || null;
      if (data.phoneNumber !== undefined) profileData.phoneNumber = data.phoneNumber || null;
      if (data.position !== undefined) profileData.position = data.position || null;

      // Only upsert if there is at least one profile-related field
      if (Object.keys(profileData).length > 0) {
        await this.prisma.adminProfile.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
            ...profileData,
          },
          update: profileData,
        });
      }
    }

    // Return the same shape as validateUser
    return this.validateUser(userId);
  }
}
