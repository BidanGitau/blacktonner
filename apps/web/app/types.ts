export type Role = "customer" | "admin" | "sales" | "technician";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  emailVerified?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  costPrice: number;
  stock: number;
  images: string[];
  brand: string;
  featured: boolean;
  active: boolean;
  badge?: string | null;
  badgeColor?: string | null;
  rating: number;
  reviews: number;
  relatedSkus?: string[];
  specs?: ProductSpec[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export interface OrderItem {
  id: string;
  product: Pick<Product, "id" | "name" | "sku" | "images">;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customer: Pick<User, "id" | "name" | "email" | "phone">;
  items: OrderItem[];
  status: OrderStatus;
  deliveryAddress: string;
  deliveryZone: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  phone: string;
  otpVerified: boolean;
  notes?: string | null;
  confirmedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  ordersToday: number;
  pending: number;
  revenue: number;
  total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CompetitorPrice {
  id: string;
  product: Product;
  competitor: string;
  price: number;
  url?: string;
  scrapedAt: string;
}

export type PostStatus = "draft" | "published";
export type PostCategory = "repair" | "how_to" | "tips" | "guide" | "news";

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  repair: "Repair",
  how_to: "How-To",
  tips:   "Tips",
  guide:  "Guide",
  news:   "News",
};

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  videoUrl: string | null;
  category: PostCategory;
  author: string;
  readMinutes: number;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
