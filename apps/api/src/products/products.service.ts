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

  async importBulk(rows: ImportRow[]) {
    const categories = await this.prisma.category.findMany({
      select: { id: true, slug: true, name: true },
    });
    const categoryByKey = new Map<string, string>();
    for (const c of categories) {
      categoryByKey.set(c.id, c.id);
      categoryByKey.set(c.slug.toLowerCase(), c.id);
      categoryByKey.set(c.name.toLowerCase(), c.id);
    }

    let created = 0;
    let updated = 0;
    const failed: { row: number; sku?: string; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      try {
        if (!row.name?.trim()) throw new Error('Missing name');
        if (!row.sku?.trim()) throw new Error('Missing sku');
        if (!row.category?.trim()) throw new Error('Missing category');
        if (row.price == null || isNaN(Number(row.price))) throw new Error('Invalid price');

        const categoryId = categoryByKey.get(row.category.trim().toLowerCase());
        if (!categoryId) throw new Error(`Unknown category "${row.category}"`);

        const sku = row.sku.trim();
        const name = row.name.trim();
        const slug = (row.slug?.trim() || slugify(name));

        const data = {
          name,
          slug,
          sku,
          brand: row.brand?.trim() || '',
          description: row.description?.trim() || '',
          price: Number(row.price),
          originalPrice: row.originalPrice != null && row.originalPrice !== '' ? Number(row.originalPrice) : null,
          costPrice: row.costPrice != null && row.costPrice !== '' ? Number(row.costPrice) : 0,
          stock: row.stock != null && row.stock !== '' ? Number(row.stock) : 0,
          images: parseList(row.images),
          featured: parseBool(row.featured) ?? false,
          active: parseBool(row.active) ?? true,
          categoryId,
        };

        const existing = await this.prisma.product.findUnique({ where: { sku }, select: { id: true } });
        if (existing) {
          await this.prisma.product.update({ where: { sku }, data });
          updated++;
        } else {
          await this.prisma.product.create({
            data: { ...data, relatedSkus: [], specs: [] },
          });
          created++;
        }
      } catch (e: any) {
        failed.push({ row: rowNum, sku: row.sku?.trim() || undefined, error: e.message ?? String(e) });
      }
    }

    return { created, updated, failed };
  }
}

export interface ImportRow {
  name?: string;
  sku?: string;
  category?: string;
  brand?: string;
  slug?: string;
  description?: string;
  price?: string | number;
  originalPrice?: string | number;
  costPrice?: string | number;
  stock?: string | number;
  images?: string;
  featured?: string | boolean;
  active?: string | boolean;
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseList(value?: string): string[] {
  if (!value) return [];
  return value.split(/[|;]/).map((v) => v.trim()).filter(Boolean);
}

function parseBool(value?: string | boolean): boolean | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const v = value.toString().trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(v)) return true;
  if (['false', '0', 'no', 'n'].includes(v)) return false;
  return undefined;
}
