import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // plain-text or SHA-256 comparison — use bcrypt in production
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== password && user.password !== hashed) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.role !== 'admin') throw new UnauthorizedException('Admin access required');

    const token = crypto.randomBytes(32).toString('hex');
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
      },
    };
  }
}
