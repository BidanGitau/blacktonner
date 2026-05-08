import { Controller, Post, Get, Param, Body, Res, HttpException, HttpStatus } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Controller('uploads')
export class UploadsController {
  private readonly dir = join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  @Post()
  upload(@Body() body: { filename: string; data: string }) {
    const ext = (body.filename.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '');
    const name = `${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const raw = body.data.replace(/^data:\w+\/\w+;base64,/, '');
    fs.writeFileSync(join(this.dir, name), Buffer.from(raw, 'base64'));
    return { url: `/api/uploads/${name}` };
  }

  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() reply: any) {
    const safe = filename.replace(/[^a-z0-9._-]/gi, '');
    const file = join(this.dir, safe);
    if (!fs.existsSync(file)) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    const ext = safe.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mime: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
    reply.header('Content-Type', mime[ext] ?? 'application/octet-stream').send(fs.readFileSync(file));
  }
}
