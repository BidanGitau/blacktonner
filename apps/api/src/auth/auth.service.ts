import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // plain-text or SHA-256 comparison — use bcrypt in production
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== password && user.password !== hashed) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!['admin', 'sales', 'technician'].includes(user.role)) {
      throw new UnauthorizedException('Staff access required');
    }

    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
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
