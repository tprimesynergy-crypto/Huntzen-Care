import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  async findAll(@Request() req: { user: { companyId?: string } }) {
    return this.newsService.findByCompany(req.user.companyId ?? null);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: { user: { companyId?: string } }) {
    return this.newsService.findOne(id, req.user.companyId ?? null);
  }
}
