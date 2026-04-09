import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private newsService: NewsService) {}

  /** All authenticated users: list all articles */
  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  /** All authenticated users: get one article */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  /** ADMIN_HUNTZEN & SUPER_ADMIN only: create article */
  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: { title: string; content: string; imageUrl?: string | null; companyId?: string | null },
  ) {
    return this.newsService.create(req.user.id, {
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl ?? null,
      companyId: body.companyId ?? null,
    });
  }

  /** ADMIN_HUNTZEN & SUPER_ADMIN only: update article */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: { title?: string; content?: string; imageUrl?: string | null },
  ) {
    return this.newsService.update(id, req.user.id, body);
  }

  /** ADMIN_HUNTZEN & SUPER_ADMIN only: delete article */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.newsService.remove(id, req.user.id);
  }
}
