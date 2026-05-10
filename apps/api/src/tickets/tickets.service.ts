import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';

type TicketStatus =
  | 'new_ticket' | 'assigned' | 'in_progress' | 'awaiting_parts'
  | 'resolved' | 'closed' | 'cancelled';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

interface CustomerEmbedded {
  id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
}

interface CreateTicketDto {
  customer: CustomerEmbedded;
  productId?: string | null;
  title: string;
  description: string;
  priority?: TicketPriority;
  raisedById?: string | null;
  assignedToId?: string | null;
  scheduledFor?: string | null;
}

interface UpdateTicketDto {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedToId?: string | null;
  scheduledFor?: string | null;
  reportUrl?: string | null;
  reportNotes?: string | null;
}

interface AddUpdateDto {
  body: string;
  authorId?: string | null;
}

interface ListParams {
  status?: TicketStatus | 'all';
  assignedToId?: string;
  customerId?: string;
  priority?: TicketPriority;
  search?: string;
}

const customerSelect = {
  select: { id: true, name: true, phone: true, email: true, company: true },
};
const userSelect = { select: { id: true, name: true, role: true } };

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  new_ticket: ['assigned', 'in_progress', 'cancelled'],
  assigned: ['in_progress', 'awaiting_parts', 'new_ticket', 'cancelled'],
  in_progress: ['awaiting_parts', 'resolved', 'assigned', 'cancelled'],
  awaiting_parts: ['in_progress', 'resolved', 'cancelled'],
  resolved: ['closed', 'in_progress', 'assigned'],
  closed: ['assigned'],
  cancelled: ['assigned', 'new_ticket'],
};

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  findAll(params: ListParams) {
    const where: any = {};
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.assignedToId) where.assignedToId = params.assignedToId;
    if (params.customerId) where.customerId = params.customerId;
    if (params.priority) where.priority = params.priority;
    if (params.search) {
      where.OR = [
        { number:      { contains: params.search, mode: 'insensitive' } },
        { title:       { contains: params.search, mode: 'insensitive' } },
        { customer:    { name:    { contains: params.search, mode: 'insensitive' } } },
        { customer:    { phone:   { contains: params.search } } },
      ];
    }
    return this.prisma.ticket.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      include: {
        customer: customerSelect,
        assignedTo: userSelect,
        raisedBy: userSelect,
        product: { select: { id: true, name: true, sku: true } },
      },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedTo: userSelect,
        raisedBy: userSelect,
        product: { select: { id: true, name: true, sku: true } },
        updates: {
          orderBy: { createdAt: 'desc' },
          include: { author: userSelect },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async create(dto: CreateTicketDto) {
    if (!dto.title?.trim() || !dto.description?.trim()) {
      throw new BadRequestException('Title and description are required');
    }

    let customerId = dto.customer.id;
    if (!customerId) {
      const customer = await this.customers.findOrCreate({
        name: dto.customer.name,
        phone: dto.customer.phone,
        email: dto.customer.email ?? null,
        company: dto.customer.company ?? null,
      });
      customerId = customer.id;
    }

    const number = await this.nextNumber();
    const initialStatus: TicketStatus = dto.assignedToId ? 'assigned' : 'new_ticket';

    const ticket = await this.prisma.ticket.create({
      data: {
        number,
        customerId,
        productId: dto.productId ?? null,
        title: dto.title.trim(),
        description: dto.description.trim(),
        priority: dto.priority ?? 'normal',
        status: initialStatus,
        raisedById: dto.raisedById ?? null,
        assignedToId: dto.assignedToId ?? null,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      },
      include: {
        customer: true,
        assignedTo: userSelect,
        raisedBy: userSelect,
      },
    });

    // Seed timeline with the creation event
    await this.prisma.ticketUpdate.create({
      data: {
        ticketId: ticket.id,
        authorId: dto.raisedById ?? null,
        body: 'Ticket raised',
        toStatus: initialStatus,
      },
    });

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket not found');

    if (dto.status === 'resolved' && !existing.reportUrl && !dto.reportUrl) {
      throw new BadRequestException(
        'A resolution report (file or notes) must be attached before marking resolved',
      );
    }

    if (dto.status && dto.status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${existing.status} to ${dto.status}`,
        );
      }
    }

    const data: any = { ...dto };
    if (dto.scheduledFor !== undefined) {
      data.scheduledFor = dto.scheduledFor ? new Date(dto.scheduledFor) : null;
    }

    let shouldLogStatusChange = false;
    if (dto.status && dto.status !== existing.status) {
      shouldLogStatusChange = true;
      if (dto.status === 'resolved' && !existing.resolvedAt) data.resolvedAt = new Date();
      if (dto.status === 'closed') data.closedAt = new Date();
      if (existing.status === 'resolved' && dto.status !== 'resolved' && dto.status !== 'closed') {
        data.resolvedAt = null;
      }
    }

    if (dto.assignedToId && !existing.assignedToId && !dto.status) {
      data.status = 'assigned';
      shouldLogStatusChange = true;
    }

    if (shouldLogStatusChange) {
      await this.prisma.ticketUpdate.create({
        data: {
          ticketId: id,
          authorId: null,
          body:
            data.status === 'resolved'
              ? `Marked resolved${dto.reportNotes ? ` — ${dto.reportNotes}` : ''}`
              : `Status changed to ${data.status}`,
          fromStatus: existing.status,
          toStatus: data.status,
        },
      });
    }

    return this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        customer: true,
        assignedTo: userSelect,
        raisedBy: userSelect,
        updates: { orderBy: { createdAt: 'desc' }, include: { author: userSelect } },
      },
    });
  }

  async addUpdate(ticketId: string, dto: AddUpdateDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const update = await this.prisma.ticketUpdate.create({
      data: {
        ticketId,
        authorId: dto.authorId ?? null,
        body: dto.body,
      },
      include: { author: userSelect },
    });

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return update;
  }

  async remove(id: string) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket not found');
    await this.prisma.ticket.delete({ where: { id } });
    return { success: true };
  }

  async stats() {
    const [open, byStatus, urgent] = await Promise.all([
      this.prisma.ticket.count({
        where: { status: { notIn: ['resolved', 'closed', 'cancelled'] } },
      }),
      this.prisma.ticket.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.ticket.count({
        where: {
          priority: 'urgent',
          status: { notIn: ['resolved', 'closed', 'cancelled'] },
        },
      }),
    ]);
    return {
      open,
      urgent,
      byStatus: byStatus.map((g) => ({ status: g.status, count: g._count._all })),
    };
  }

  listTechnicians() {
    return this.prisma.user.findMany({
      where: { role: { in: ['technician', 'admin'] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  // ── Helpers ─────────────────────────────────────────
  private async nextNumber() {
    const year = new Date().getFullYear();
    const prefix = `TKT-${year}-`;
    const last = await this.prisma.ticket.findFirst({
      where: { number: { startsWith: prefix } },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    let nextSeq = 1;
    if (last) {
      const tail = last.number.slice(prefix.length);
      const parsed = parseInt(tail, 10);
      if (!isNaN(parsed)) nextSeq = parsed + 1;
    }
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }
}
