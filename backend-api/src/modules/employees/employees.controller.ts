import { Controller, Get, Patch, Body, UseGuards, Request, Param, Post, Delete } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateEmployeeMeDto } from './dto/update-employee-me.dto';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get('me')
  async getMe(@Request() req) {
    return this.employeesService.findMe(req.user.id);
  }

  @Patch('me')
  async updateMe(@Request() req, @Body() dto: UpdateEmployeeMeDto) {
    return this.employeesService.updateMe(req.user.id, dto);
  }

  @Get('me/favorite-practitioners')
  async getFavoritePractitioners(@Request() req) {
    return this.employeesService.getFavoritePractitioners(req.user.id);
  }

  @Post('me/favorite-practitioners/:practitionerId')
  async addFavoritePractitioner(@Request() req, @Param('practitionerId') practitionerId: string) {
    return this.employeesService.addFavoritePractitioner(req.user.id, practitionerId);
  }

  @Delete('me/favorite-practitioners/:practitionerId')
  async removeFavoritePractitioner(@Request() req, @Param('practitionerId') practitionerId: string) {
    return this.employeesService.removeFavoritePractitioner(req.user.id, practitionerId);
  }
}
