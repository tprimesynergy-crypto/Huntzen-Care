import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'profile');
  private readonly companyUploadDir = path.join(process.cwd(), 'uploads', 'company');
  private readonly newsUploadDir = path.join(process.cwd(), 'uploads', 'news');
  private readonly messageUploadDir = path.join(process.cwd(), 'uploads', 'messages');

  async saveMessageAttachment(buffer: Buffer, originalName: string, mimetype: string): Promise<string> {
    await fs.mkdir(this.messageUploadDir, { recursive: true });
    const base = path.basename(originalName || 'file');
    const ext = base.split('.').pop()?.toLowerCase() || mimetype.split('/')[1] || 'bin';
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt'].includes(ext) ? ext : 'bin';
    const unique = `${crypto.randomUUID()}.${safeExt}`;
    const filePath = path.join(this.messageUploadDir, unique);
    await fs.writeFile(filePath, buffer);
    return `/uploads/messages/${unique}`;
  }

  async saveCompanyPhoto(
    companyId: string,
    type: 'logo' | 'cover',
    buffer: Buffer,
    ext: string,
  ): Promise<string> {
    const dir = path.join(this.companyUploadDir, companyId);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${type}.${ext}`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/company/${companyId}/${filename}`;
  }

  async saveProfilePhoto(
    userId: string,
    type: 'avatar' | 'cover',
    buffer: Buffer,
    ext: string,
  ): Promise<string> {
    const dir = path.join(this.uploadDir, userId);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${type}.${ext}`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/profile/${userId}/${filename}`;
  }

  async saveNewsImage(buffer: Buffer, ext: string): Promise<string> {
    await fs.mkdir(this.newsUploadDir, { recursive: true });
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(this.newsUploadDir, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/news/${filename}`;
  }

  async deleteProfilePhoto(userId: string, type: 'avatar' | 'cover'): Promise<void> {
    const dir = path.join(this.uploadDir, userId);
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    for (const ext of extensions) {
      const filePath = path.join(dir, `${type}.${ext}`);
      try {
        await fs.unlink(filePath);
      } catch {
        // ignore if not found
      }
    }
  }
}
