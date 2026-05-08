import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  description: true,
  price: true,
  originalPrice: true,
  costPrice: true,
  stock: true,
  images: true,
  brand: true,
  featured: true,
  active: true,
  badge: true,
  badgeColor: true,
  rating: true,
  reviews: true,
  relatedSkus: true,
  specs: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
};

function serialize(p: any) {
  return {
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    costPrice: Number(p.costPrice),
  };
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    category?: string;
    featured?: boolean;
    search?: string;
    badge?: string;
    limit?: number;
    active?: boolean;
  } = {}) {
    const { category, featured, search, badge, limit, active } = params;

    const where: any = {};
    if (active !== undefined) where.active = active;
    if (featured !== undefined) where.featured = featured;
    if (badge) where.badge = badge;
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      select: PRODUCT_SELECT,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      ...(limit ? { take: limit } : {}),
    });

    return products.map(serialize);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: PRODUCT_SELECT,
    });
    if (!product) throw new NotFoundException('Product not found');
    return serialize(product);
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        sku: dto.sku,
        description: dto.description,
        price: dto.price,
        originalPrice: dto.originalPrice ?? null,
        costPrice: dto.costPrice,
        stock: dto.stock ?? 0,
        images: dto.images ?? [],
        brand: dto.brand,
        featured: dto.featured ?? false,
        active: dto.active ?? true,
        badge: dto.badge ?? null,
        badgeColor: dto.badgeColor ?? null,
        rating: dto.rating ?? 0,
        reviews: dto.reviews ?? 0,
        relatedSkus: dto.relatedSkus ?? [],
        specs: dto.specs ?? [],
        metaTitle: dto.metaTitle ?? null,
        metaDescription: dto.metaDescription ?? null,
        categoryId: dto.categoryId,
      },
      select: PRODUCT_SELECT,
    });
    return serialize(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.originalPrice !== undefined && { originalPrice: dto.originalPrice }),
        ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.badge !== undefined && { badge: dto.badge }),
        ...(dto.badgeColor !== undefined && { badgeColor: dto.badgeColor }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.reviews !== undefined && { reviews: dto.reviews }),
        ...(dto.relatedSkus !== undefined && { relatedSkus: dto.relatedSkus }),
        ...(dto.specs !== undefined && { specs: dto.specs }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      },
      select: PRODUCT_SELECT,
    });
    return serialize(product);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async importCsv(csvContent: string) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const created: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, j) => { row[h] = values[j] ?? ''; });

      try {
        const product = await this.prisma.product.create({
          data: {
            name: row.name,
            slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            sku: row.sku,
            brand: row.brand || '',
            description: row.description || '',
            price: Number(row.price) || 0,
            originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
            costPrice: Number(row.costPrice) || 0,
            stock: Number(row.stock) || 0,
            images: [],
            featured: false,
            active: true,
            relatedSkus: [],
            specs: [],
            categoryId: row.categoryId,
          },
          select: { id: true, name: true },
        });
        created.push(product.id);
      } catch (e: any) {
        errors.push(`Row ${i}: ${e.message}`);
      }
    }

    return { created: created.length, errors };
  }
}
