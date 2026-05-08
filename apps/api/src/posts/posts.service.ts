import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type PostStatus = 'draft' | 'published';
type PostCategory = 'repair' | 'how_to' | 'tips' | 'guide' | 'news';

interface CreatePostDto {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage?: string | null;
  videoUrl?: string | null;
  category?: PostCategory;
  author?: string;
  readMinutes?: number;
  tags?: string[];
  status?: PostStatus;
}

interface UpdatePostDto extends Partial<CreatePostDto> {}

interface ListParams {
  category?: string;
  search?: string;
  limit?: number;
  status?: PostStatus | 'all';
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // Public — published only
  findAllPublic(params: ListParams) {
    const where: any = { status: 'published' };
    if (params.category && params.category !== 'all') where.category = params.category;
    if (params.search) {
      where.OR = [
        { title:   { contains: params.search, mode: 'insensitive' } },
        { excerpt: { contains: params.search, mode: 'insensitive' } },
        { body:    { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: params.limit,
    });
  }

  findOnePublic(slug: string) {
    return this.prisma.post.findFirst({
      where: { slug, status: 'published' },
    });
  }

  // Admin — all posts
  findAllAdmin(params: ListParams) {
    const where: any = {};
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.category && params.category !== 'all') where.category = params.category;
    if (params.search) {
      where.OR = [
        { title:   { contains: params.search, mode: 'insensitive' } },
        { excerpt: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.post.findMany({ where, orderBy: { updatedAt: 'desc' } });
  }

  findOneAdmin(id: string) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  async create(dto: CreatePostDto) {
    const data: any = {
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      body: dto.body,
      coverImage: dto.coverImage ?? null,
      videoUrl: dto.videoUrl ?? null,
      category: dto.category ?? 'how_to',
      author: dto.author ?? 'Blacktoner Team',
      readMinutes: dto.readMinutes ?? 3,
      tags: dto.tags ?? [],
      status: dto.status ?? 'draft',
    };
    if (data.status === 'published') data.publishedAt = new Date();
    return this.prisma.post.create({ data });
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    const data: any = { ...dto };
    // first publish — set publishedAt
    if (dto.status === 'published' && existing.status !== 'published') {
      data.publishedAt = new Date();
    }
    // unpublish — clear publishedAt
    if (dto.status === 'draft' && existing.status === 'published') {
      data.publishedAt = null;
    }
    return this.prisma.post.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }
}
