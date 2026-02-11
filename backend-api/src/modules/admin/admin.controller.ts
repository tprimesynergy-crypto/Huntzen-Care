import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { Role, Specialty } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Platform stats & practitioners - declare before parameterized routes
  @UseGuards(JwtAuthGuard)
  @Get('stats/platform')
  async getPlatformStats(@Request() req: { user: { id: string } }) {
    return this.adminService.getPlatformStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('practitioners')
  async listPractitioners(@Request() req: { user: { id: string } }) {
    return this.adminService.listPractitioners(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async listAdminUsers(@Request() req: { user: { id: string } }) {
    return this.adminService.listAdminUsers(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users')
  async createAdminUser(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      email: string;
      role: Role;
      companyId?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      phoneNumber?: string | null;
      position?: string | null;
    },
  ) {
    return this.adminService.createAdminUser(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:userId')
  async updateAdminUser(
    @Request() req: { user: { id: string } },
    @Param('userId') userId: string,
    @Body()
    body: {
      email?: string;
      role?: Role;
      companyId?: string | null;
      isActive?: boolean;
      firstName?: string | null;
      lastName?: string | null;
      phoneNumber?: string | null;
      position?: string | null;
    },
  ) {
    return this.adminService.updateAdminUser(req.user.id, userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:userId/password')
  async updateAdminPassword(
    @Request() req: { user: { id: string } },
    @Param('userId') userId: string,
    @Body() body: { password: string },
  ) {
    return this.adminService.updateAdminPassword(
      req.user.id,
      userId,
      body.password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('activity-logs')
  async getActivityLogs(
    @Request() req: { user: { id: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('action') action?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getActivityLogs(req.user.id, {
      from,
      to,
      action,
      actorUserId,
      page: page != null ? Number(page) : undefined,
      limit: limit != null ? Number(limit) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('companies')
  async listCompanies(@Request() req: { user: { id: string } }) {
    return this.adminService.listCompanies(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('companies')
  async createCompany(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      name: string;
      slug: string;
      legalName?: string | null;
      siret?: string | null;
      sector?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
      logoUrl?: string | null;
      coverUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    return this.adminService.createCompany(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('companies/:companyId')
  async updateCompany(
    @Request() req: { user: { id: string } },
    @Param('companyId') companyId: string,
    @Body()
    body: {
      name?: string;
      slug?: string;
      legalName?: string | null;
      siret?: string | null;
      sector?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
      logoUrl?: string | null;
      coverUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    return this.adminService.updateCompany(req.user.id, companyId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('companies/:companyId/employees')
  async listEmployeesByCompany(
    @Request() req: { user: { id: string } },
    @Param('companyId') companyId: string,
  ) {
    return this.adminService.listEmployeesByCompany(req.user.id, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('practitioners')
  async createPractitioner(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      email: string;
      password?: string;
      firstName: string;
      lastName: string;
      title: string;
      professionalId?: string | null;
      specialty: Specialty;
      customSpecialty?: string | null;
      subSpecialties?: string[];
      languages?: string[];
      bio: string;
      experience?: number | null;
      education?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
      offersVideo?: boolean;
      offersPhone?: boolean;
      isValidated?: boolean;
      defaultDuration?: number;
      timezone?: string;
      isActive?: boolean;
      isAcceptingNewClients?: boolean;
      companyId?: string | null;
    },
  ) {
    return this.adminService.createPractitioner(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('practitioners/:practitionerId')
  async updatePractitioner(
    @Request() req: { user: { id: string } },
    @Param('practitionerId') practitionerId: string,
    @Body()
    body: {
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
      isValidated?: boolean;
      defaultDuration?: number;
      timezone?: string;
      isActive?: boolean;
      isAcceptingNewClients?: boolean;
      companyId?: string | null;
    },
  ) {
    try {
      return await this.adminService.updatePractitioner(req.user.id, practitionerId, body);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : '';
      console.error('[AdminController.updatePractitioner] CAUGHT ERROR:', message);
      console.error('[AdminController.updatePractitioner] Stack:', stack);
      if (err && typeof err === 'object' && 'code' in err) {
        console.error('[AdminController.updatePractitioner] Prisma code:', (err as { code: string }).code);
        if ('meta' in err) console.error('[AdminController.updatePractitioner] Prisma meta:', (err as { meta: unknown }).meta);
      }
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('practitioners/:practitionerId/active')
  async setPractitionerActive(
    @Request() req: { user: { id: string } },
    @Param('practitionerId') practitionerId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.setPractitionerActive(
      req.user.id,
      practitionerId,
      body.isActive,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('practitioners/:practitionerId/password')
  async setPractitionerPassword(
    @Request() req: { user: { id: string } },
    @Param('practitionerId') practitionerId: string,
    @Body() body: { newPassword: string },
  ) {
    return this.adminService.setPractitionerPassword(req.user.id, practitionerId, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('practitioners/:practitionerId')
  async deletePractitioner(
    @Request() req: { user: { id: string } },
    @Param('practitionerId') practitionerId: string,
  ) {
    return this.adminService.deletePractitioner(req.user.id, practitionerId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:userId')
  async deleteAdminUser(
    @Request() req: { user: { id: string } },
    @Param('userId') userId: string,
  ) {
    return this.adminService.deleteAdminUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('companies/:companyId')
  async deleteCompany(
    @Request() req: { user: { id: string } },
    @Param('companyId') companyId: string,
  ) {
    return this.adminService.deleteCompany(req.user.id, companyId);
  }
}

