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

// ── Sales / Leads ─────────────────────────────────────
export type LeadStatus =
  | "new_lead" | "contacted" | "qualified" | "proposal_sent"
  | "negotiating" | "won" | "lost" | "on_hold";

export type LeadSource =
  | "catalogue" | "checkout" | "walk_in" | "referral"
  | "inbound_call" | "whatsapp" | "social" | "other";

export type LeadActivityType =
  | "call_outbound" | "call_inbound" | "whatsapp" | "email"
  | "meeting" | "note" | "status_change";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new_lead:      "New",
  contacted:     "Contacted",
  qualified:     "Qualified",
  proposal_sent: "Proposal Sent",
  negotiating:   "Negotiating",
  won:           "Won",
  lost:          "Lost",
  on_hold:       "On Hold",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new_lead:      "border-blue-200 bg-blue-50 text-blue-700",
  contacted:     "border-indigo-200 bg-indigo-50 text-indigo-700",
  qualified:     "border-violet-200 bg-violet-50 text-violet-700",
  proposal_sent: "border-amber-200 bg-amber-50 text-amber-700",
  negotiating:   "border-orange-200 bg-orange-50 text-orange-700",
  won:           "border-emerald-200 bg-emerald-50 text-emerald-700",
  lost:          "border-red-200 bg-red-50 text-red-700",
  on_hold:       "border-stone-200 bg-stone-50 text-stone-600",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  catalogue:    "Catalogue",
  checkout:     "Checkout",
  walk_in:      "Walk-In",
  referral:     "Referral",
  inbound_call: "Inbound Call",
  whatsapp:     "WhatsApp",
  social:       "Social",
  other:        "Other",
};

export const LEAD_ACTIVITY_LABELS: Record<LeadActivityType, string> = {
  call_outbound: "Outbound Call",
  call_inbound:  "Inbound Call",
  whatsapp:      "WhatsApp",
  email:         "Email",
  meeting:       "Meeting",
  note:          "Note",
  status_change: "Status Change",
};

export interface LeadAgent {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  outcome: string | null;
  feedback: string | null;
  durationSec: number | null;
  recordingUrl: string | null;
  agent: LeadAgent | null;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  estimatedValue: number | null;
  nextFollowUp: string | null;
  closedAt: string | null;
  closedReason: string | null;
  assignedTo: LeadAgent | null;
  createdBy: LeadAgent | null;
  activities?: LeadActivity[];
  _count?: { activities: number };
  createdAt: string;
  updatedAt: string;
}

export interface LeadPipelineStat {
  status: LeadStatus;
  count: number;
  estimatedValue: number;
}

// ── Customer / Invoice / Ticket ───────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  invoices?: Invoice[];
  tickets?: Ticket[];
  leads?: Lead[];
  _count?: { invoices: number; tickets: number; leads: number };
}

export type InvoiceStatus = "draft" | "issued" | "partial" | "paid" | "cancelled";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft:     "Draft",
  issued:    "Issued",
  partial:   "Partial",
  paid:      "Paid",
  cancelled: "Cancelled",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft:     "border-stone-200 bg-stone-50 text-stone-600",
  issued:    "border-blue-200 bg-blue-50 text-blue-700",
  partial:   "border-amber-200 bg-amber-50 text-amber-700",
  paid:      "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

export interface InvoiceItem {
  id: string;
  productId: string | null;
  sku: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customer?: Customer;
  items?: InvoiceItem[];
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  dueDate: string | null;
  notes: string | null;
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
}

export interface InvoiceStats {
  outstanding: number;
  outstandingCount: number;
  paidToday: number;
  paidTodayCount: number;
  drafts: number;
}

export type TicketStatus =
  | "new_ticket" | "assigned" | "in_progress" | "awaiting_parts"
  | "resolved" | "closed" | "cancelled";

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  new_ticket:     "New",
  assigned:       "Assigned",
  in_progress:    "In Progress",
  awaiting_parts: "Awaiting Parts",
  resolved:       "Resolved",
  closed:         "Closed",
  cancelled:      "Cancelled",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low:    "Low",
  normal: "Normal",
  high:   "High",
  urgent: "Urgent",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  new_ticket:     "border-blue-200 bg-blue-50 text-blue-700",
  assigned:       "border-indigo-200 bg-indigo-50 text-indigo-700",
  in_progress:    "border-orange-200 bg-orange-50 text-orange-700",
  awaiting_parts: "border-amber-200 bg-amber-50 text-amber-700",
  resolved:       "border-emerald-200 bg-emerald-50 text-emerald-700",
  closed:         "border-stone-300 bg-stone-100 text-stone-700",
  cancelled:      "border-red-200 bg-red-50 text-red-700",
};

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  low:    "border-stone-200 bg-stone-50 text-stone-600",
  normal: "border-blue-200 bg-blue-50 text-blue-700",
  high:   "border-orange-200 bg-orange-50 text-orange-700",
  urgent: "border-red-200 bg-red-50 text-red-700",
};

export interface TicketUpdate {
  id: string;
  body: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  author: { id: string; name: string; role?: string } | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: string;
  customerId: string;
  customer?: Customer;
  productId: string | null;
  product?: { id: string; name: string; sku: string } | null;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  raisedBy: { id: string; name: string; role?: string } | null;
  assignedTo: { id: string; name: string; role?: string } | null;
  scheduledFor: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  reportUrl: string | null;
  reportNotes: string | null;
  updates?: TicketUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketStats {
  open: number;
  urgent: number;
  byStatus: { status: TicketStatus; count: number }[];
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
