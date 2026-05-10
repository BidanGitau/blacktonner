import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UpsertCustomerDto {
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  search(q?: string, limit = 50) {
    const where: any = {};
    if (q) {
      where.OR = [
        { name:    { contains: q, mode: 'insensitive' } },
        { phone:   { contains: q } },
        { email:   { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.customer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { invoices: true, tickets: true, leads: true } },
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { items: true } } },
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          include: { assignedTo: { select: { id: true, name: true } } },
        },
        leads: { orderBy: { updatedAt: 'desc' } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  /** Find by phone (normalized). Used by invoice + ticket flows to auto-link. */
  findByPhone(phone: string) {
    return this.prisma.customer.findFirst({ where: { phone } });
  }

  create(dto: UpsertCustomerDto) {
    return this.prisma.customer.create({ data: { ...dto } as any });
  }

  /** Find or create by phone. Used when sales completes a sale to a walk-in. */
  async findOrCreate(dto: UpsertCustomerDto) {
    const existing = await this.findByPhone(dto.phone);
    if (existing) {
      // top up empty fields (don't overwrite existing data)
      const patch: any = {};
      if (!existing.email && dto.email) patch.email = dto.email;
      if (!existing.company && dto.company) patch.company = dto.company;
      if (!existing.address && dto.address) patch.address = dto.address;
      if (Object.keys(patch).length) {
        return this.prisma.customer.update({ where: { id: existing.id }, data: patch });
      }
      return existing;
    }
    return this.create(dto);
  }

  async update(id: string, dto: Partial<UpsertCustomerDto>) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Customer not found');
    return this.prisma.customer.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { invoices: true, tickets: true } } },
    });
    if (!existing) throw new NotFoundException('Customer not found');
    if (existing._count.invoices || existing._count.tickets) {
      throw new Error('Cannot delete customer with invoices or tickets attached');
    }
    await this.prisma.customer.delete({ where: { id } });
    return { success: true };
  }
}
