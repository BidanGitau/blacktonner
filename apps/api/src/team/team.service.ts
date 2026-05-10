import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type StaffRole = 'admin' | 'sales' | 'technician';

interface CreateTeamMemberDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: StaffRole;
}

interface UpdateTeamMemberDto {
  name?: string;
  phone?: string;
  password?: string;
  role?: StaffRole;
}

const memberSelect = {
  id: true, name: true, email: true, phone: true, role: true,
  emailVerified: true, lastLogin: true, createdAt: true, updatedAt: true,
};

function hash(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      where: { role: { in: ['admin', 'sales', 'technician'] } },
      select: memberSelect,
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateTeamMemberDto) {
    if (!dto.email || !dto.password) throw new BadRequestException('Email and password required');
    if (!['admin', 'sales', 'technician'].includes(dto.role)) {
      throw new BadRequestException('Invalid role');
    }
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already in use');

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hash(dto.password),
        role: dto.role,
        emailVerified: true,
      },
      select: memberSelect,
    });
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team member not found');
    if (dto.role && !['admin', 'sales', 'technician'].includes(dto.role)) {
      throw new BadRequestException('Invalid role');
    }

    const data: any = { ...dto };
    if (dto.password) data.password = hash(dto.password);

    return this.prisma.user.update({
      where: { id },
      data,
      select: memberSelect,
    });
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException("You can't delete your own account");
    }
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team member not found');
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
