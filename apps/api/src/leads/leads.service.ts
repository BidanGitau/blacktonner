import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type LeadStatus =
  | 'new_lead' | 'contacted' | 'qualified' | 'proposal_sent'
  | 'negotiating' | 'won' | 'lost' | 'on_hold';
type LeadSource =
  | 'catalogue' | 'checkout' | 'walk_in' | 'referral'
  | 'inbound_call' | 'whatsapp' | 'social' | 'other';
type LeadActivityType =
  | 'call_outbound' | 'call_inbound' | 'whatsapp' | 'email'
  | 'meeting' | 'note' | 'status_change';

interface CreateLeadDto {
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string | null;
  estimatedValue?: number | null;
  nextFollowUp?: string | null;
  assignedToId?: string | null;
  createdById?: string | null;
}

interface UpdateLeadDto extends Partial<CreateLeadDto> {
  closedReason?: string | null;
}

interface CreateActivityDto {
  type: LeadActivityType;
  outcome?: string | null;
  feedback?: string | null;
  durationSec?: number | null;
  recordingUrl?: string | null;
  agentId?: string | null;
}

interface ListParams {
  status?: LeadStatus | 'all';
  assignedToId?: string;
  source?: LeadSource;
  search?: string;
  page?: number;
  limit?: number;
}

const userSelect = { select: { id: true, name: true, email: true } } as const;
const leadInclude = {
  assignedTo: userSelect,
  createdBy: userSelect,
  _count: { select: { activities: true } },
};

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new_lead: ['contacted', 'on_hold'],
  contacted: ['qualified', 'new_lead', 'on_hold'],
  qualified: ['proposal_sent', 'contacted', 'on_hold'],
  proposal_sent: ['negotiating', 'lost', 'qualified', 'on_hold'],
  negotiating: ['won', 'lost', 'proposal_sent', 'on_hold'],
  won: [],
  lost: ['new_lead'],
  on_hold: ['contacted', 'new_lead'],
};

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: ListParams) {
    const { page = 1, limit = 20 } = params;
    const where: any = {};
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.assignedToId) where.assignedToId = params.assignedToId;
    if (params.source) where.source = params.source;
    if (params.search) {
      where.OR = [
        { name:    { contains: params.search, mode: 'insensitive' } },
        { phone:   { contains: params.search } },
        { email:   { contains: params.search, mode: 'insensitive' } },
        { company: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: leadInclude,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        ...leadInclude,
        activities: {
          include: { agent: userSelect },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  create(dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        company: dto.company ?? null,
        source: dto.source ?? 'other',
        status: dto.status ?? 'new_lead',
        notes: dto.notes ?? null,
        estimatedValue: dto.estimatedValue ?? null,
        nextFollowUp: dto.nextFollowUp ? new Date(dto.nextFollowUp) : null,
        assignedToId: dto.assignedToId ?? null,
        createdById: dto.createdById ?? null,
      },
      include: leadInclude,
    });
  }

  async update(id: string, dto: UpdateLeadDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lead not found');

    const data: any = { ...dto };
    if (dto.nextFollowUp !== undefined) {
      data.nextFollowUp = dto.nextFollowUp ? new Date(dto.nextFollowUp) : null;
    }

    if (dto.status && dto.status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${existing.status} to ${dto.status}`,
        );
      }

      const closing = dto.status === 'won' || dto.status === 'lost';
      if (closing) data.closedAt = new Date();
      if (!closing && existing.closedAt) data.closedAt = null;

      await this.prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'status_change',
          fromStatus: existing.status,
          toStatus: dto.status,
          feedback: dto.closedReason ?? null,
        },
      });
    }

    return this.prisma.lead.update({
      where: { id },
      data,
      include: leadInclude,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lead not found');
    await this.prisma.lead.delete({ where: { id } });
    return { success: true };
  }

  // ── Activities ───────────────────────────────────────
  async addActivity(leadId: string, dto: CreateActivityDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const activity = await this.prisma.leadActivity.create({
      data: {
        leadId,
        type: dto.type,
        outcome: dto.outcome ?? null,
        feedback: dto.feedback ?? null,
        durationSec: dto.durationSec ?? null,
        recordingUrl: dto.recordingUrl ?? null,
        agentId: dto.agentId ?? null,
      },
      include: { agent: userSelect },
    });

    // Touch the lead so updatedAt reflects latest activity
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { updatedAt: new Date() },
    });

    return activity;
  }

  // ── Pipeline summary ─────────────────────────────────
  async pipelineStats() {
    const grouped = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { estimatedValue: true },
    });
    return grouped.map((g) => ({
      status: g.status,
      count: g._count._all,
      estimatedValue: g._sum.estimatedValue ? Number(g._sum.estimatedValue) : 0,
    }));
  }

  // ── Sales agents (users with sales/admin role) ───────
  listAgents() {
    return this.prisma.user.findMany({
      where: { role: { in: ['sales', 'admin'] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }
}
