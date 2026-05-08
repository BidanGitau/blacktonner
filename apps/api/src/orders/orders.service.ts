import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ORDER_SELECT = {
  id: true,
  status: true,
  deliveryAddress: true,
  deliveryZone: true,
  deliveryFee: true,
  subtotal: true,
  total: true,
  phone: true,
  otpVerified: true,
  notes: true,
  confirmedAt: true,
  deliveredAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, name: true, email: true, phone: true } },
  items: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      total: true,
      product: { select: { id: true, name: true, sku: true, images: true } },
    },
  },
};

function serialize(o: any) {
  return {
    ...o,
    deliveryFee: Number(o.deliveryFee),
    subtotal: Number(o.subtotal),
    total: Number(o.total),
    items: o.items.map((i: any) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      total: Number(i.total),
    })),
  };
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, pending, revenue, total] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { status: 'pending_confirmation' } }),
      this.prisma.order.aggregate({
        where: { status: { in: ['confirmed', 'out_for_delivery', 'delivered'] } },
        _sum: { total: true },
      }),
      this.prisma.order.count(),
    ]);

    return { ordersToday, pending, revenue: Number(revenue._sum.total ?? 0), total };
  }

  async findAll(params: {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { status, search, from, to, page = 1, limit = 20 } = params;
    const where: any = {};

    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: ORDER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map(serialize),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, select: ORDER_SELECT });
    if (!order) throw new NotFoundException('Order not found');
    return serialize(order);
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    const data: any = { status };
    if (status === 'delivered') data.deliveredAt = new Date();
    if (status === 'cancelled') data.cancelledAt = new Date();
    return serialize(
      await this.prisma.order.update({ where: { id }, data, select: ORDER_SELECT }),
    );
  }

  async confirm(id: string) {
    const order = await this.findOne(id);
    if (order.status !== 'pending_confirmation') {
      throw new Error('Order is not pending confirmation');
    }
    return serialize(
      await this.prisma.order.update({
        where: { id },
        data: { status: 'confirmed', confirmedAt: new Date() },
        select: ORDER_SELECT,
      }),
    );
  }
}
