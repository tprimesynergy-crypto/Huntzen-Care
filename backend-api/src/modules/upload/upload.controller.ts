import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    const type = (req as any).body?.type as string;
    if (!type || !['avatar', 'cover'].includes(type)) {
      throw new BadRequestException('Body "type" must be "avatar" or "cover".');
    }
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required.');
    }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Allowed types: JPEG, PNG, GIF, WebP.');
    }
    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1] || 'jpg';
    const relativePath = await this.uploadService.saveProfilePhoto(
      req.user.id,
      type as 'avatar' | 'cover',
      file.buffer,
      ext,
    );
    return { url: relativePath };
  }

  @Post('company-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyPhoto(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    const type = (req as any).body?.type as string;
    const companyId = (req as any).body?.companyId as string;
    if (!type || !['logo', 'cover'].includes(type)) {
      throw new BadRequestException('Body "type" must be "logo" or "cover".');
    }
    if (!companyId || typeof companyId !== 'string') {
      throw new BadRequestException('Body "companyId" is required.');
    }
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required.');
    }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Allowed types: JPEG, PNG, GIF, WebP.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, companyId: true },
    });
    if (!user) {
      throw new ForbiddenException('User not found.');
    }
    const canUpdate =
      user.role === Role.SUPER_ADMIN ||
      user.role === Role.ADMIN_HUNTZEN ||
      (user.role === Role.ADMIN_RH && user.companyId === companyId);
    if (!canUpdate) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette entreprise.');
    }

    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1] || 'jpg';
    const relativePath = await this.uploadService.saveCompanyPhoto(
      companyId,
      type as 'logo' | 'cover',
      file.buffer,
      ext,
    );
    return { url: relativePath };
  }

  @Post('news-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadNewsImage(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });
    if (!user || (user.role !== Role.ADMIN_HUNTZEN && user.role !== Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Seuls Admin HuntZen et Super Admin peuvent téléverser des images d\'articles.');
    }
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required.');
    }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Allowed types: JPEG, PNG, GIF, WebP.');
    }
    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1] || 'jpg';
    const relativePath = await this.uploadService.saveNewsImage(file.buffer, ext);
    return { url: relativePath };
  }

  @Post('message-attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMessageAttachment(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname?: string } | undefined,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required.');
    }
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Allowed: images (JPEG, PNG, GIF, WebP), PDF, Word, TXT.');
    }
    const filename = file.originalname || 'file';
    const relativePath = await this.uploadService.saveMessageAttachment(
      file.buffer,
      filename,
      file.mimetype,
    );
    return { url: relativePath };
  }
}
