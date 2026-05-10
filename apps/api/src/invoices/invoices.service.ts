import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';

type InvoiceStatus = 'draft' | 'issued' | 'partial' | 'paid' | 'cancelled';

interface InvoiceItemDto {
  productId?: string | null;
  sku?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CustomerDtoEmbedded {
  id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  address?: string | null;
}

interface CreateInvoiceDto {
  customer: CustomerDtoEmbedded;
  items: InvoiceItemDto[];
  status?: InvoiceStatus;
  taxRate?: number;
  paidAmount?: number;
  dueDate?: string | null;
  notes?: string | null;
  createdById?: string | null;
}

interface UpdateInvoiceDto {
  status?: InvoiceStatus;
  paidAmount?: number;
  dueDate?: string | null;
  notes?: string | null;
}

interface ListParams {
  status?: InvoiceStatus | 'all';
  customerId?: string;
  search?: string;
}

const customerSelect = { select: { id: true, name: true, phone: true, email: true, company: true } };
const userSelect = { select: { id: true, name: true } };

const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['issued', 'cancelled'],
  issued: ['partial', 'paid', 'cancelled'],
  partial: ['paid', 'issued', 'cancelled'],
  paid: [],
  cancelled: ['draft'],
};

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  async findAll(params: ListParams) {
    const where: any = {};
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.customerId) where.customerId = params.customerId;
    if (params.search) {
      where.OR = [
        { number:   { contains: params.search, mode: 'insensitive' } },
        { customer: { name:    { contains: params.search, mode: 'insensitive' } } },
        { customer: { phone:   { contains: params.search } } },
        { customer: { company: { contains: params.search, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: customerSelect,
        createdBy: userSelect,
        _count: { select: { items: true } },
      },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        createdBy: userSelect,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    if (!dto.items?.length) throw new BadRequestException('Invoice needs at least one item');

    // Resolve customer — either by id or find/create by phone
    let customerId = dto.customer.id;
    if (!customerId) {
      const customer = await this.customers.findOrCreate({
        name: dto.customer.name,
        phone: dto.customer.phone,
        email: dto.customer.email ?? null,
        company: dto.customer.company ?? null,
        address: dto.customer.address ?? null,
      });
      customerId = customer.id;
    }

    const subtotal = dto.items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
    const taxRate = dto.taxRate ?? 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const number = await this.nextNumber();

    const status = dto.status ?? 'draft';

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        customerId,
        status,
        subtotal,
        taxRate,
        taxAmount,
        total,
        paidAmount: dto.paidAmount ?? 0,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes ?? null,
        createdById: dto.createdById ?? null,
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId ?? null,
            sku: i.sku ?? null,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: Number(i.quantity) * Number(i.unitPrice),
          })),
        },
      },
      include: { customer: true, items: true, createdBy: userSelect },
    });

    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Invoice not found');

    const data: any = { ...dto };
    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    if (dto.status && dto.status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${existing.status} to ${dto.status}`,
        );
      }
    }

    if (dto.paidAmount !== undefined && !dto.status) {
      const total = Number(existing.total);
      const paid = Number(dto.paidAmount);
      if (paid <= 0) data.status = 'issued';
      else if (paid < total) data.status = 'partial';
      else data.status = 'paid';
    }

    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { customer: true, items: true, createdBy: userSelect },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Invoice not found');
    await this.prisma.invoice.delete({ where: { id } });
    return { success: true };
  }

  // ── Helpers ─────────────────────────────────────────
  /** Generate next invoice number — INV-YYYY-NNNN, sequential per year. */
  private async nextNumber() {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const last = await this.prisma.invoice.findFirst({
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

  async stats() {
    const [outstanding, paidToday, drafts] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { status: { in: ['issued', 'partial'] } },
        _sum: { total: true, paidAmount: true },
        _count: { _all: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: 'paid',
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.invoice.count({ where: { status: 'draft' } }),
    ]);

    const totalOutstanding = Number(outstanding._sum.total ?? 0);
    const totalPaid = Number(outstanding._sum.paidAmount ?? 0);

    return {
      outstanding: totalOutstanding - totalPaid,
      outstandingCount: outstanding._count._all,
      paidToday: Number(paidToday._sum.total ?? 0),
      paidTodayCount: paidToday._count._all,
      drafts,
    };
  }
}
