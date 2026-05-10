import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async count(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.category.count({ where });
  }

  create(data: { name: string; slug: string; description?: string }) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: { name?: string; slug?: string; description?: string }) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }
}
