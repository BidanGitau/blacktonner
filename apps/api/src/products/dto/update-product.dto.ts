import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto implements Partial<CreateProductDto> {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  price?: number;
  originalPrice?: number | null;
  costPrice?: number;
  stock?: number;
  images?: string[];
  brand?: string;
  featured?: boolean;
  active?: boolean;
  badge?: string | null;
  badgeColor?: string | null;
  rating?: number;
  reviews?: number;
  relatedSkus?: string[];
  specs?: { label: string; value: string }[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  categoryId?: string;
}
