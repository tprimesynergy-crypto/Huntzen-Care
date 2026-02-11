import { Controller, Post, Body, Get, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('invitations/validate/:token')
  async validateInvitation(@Param('token') token: string) {
    return this.authService.validateInvitationToken(token);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() body: { email?: string; firstName?: string; lastName?: string; phoneNumber?: string; position?: string },
  ) {
    return this.authService.updateMe(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/export-data')
  async exportMyData(@Request() req) {
    return this.authService.exportMyData(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMyAccount(@Request() req) {
    return this.authService.deleteMyAccount(req.user.id);
  }
}
