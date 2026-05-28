export type ApiErrorItem = {
  field?: string;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiErrorItem[] | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  meta: PaginationMeta;
}>;

export type Product = {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  categoryId: number;
  brand: string;
  price: string;
  originalPrice: string | null;
  discountPercent: number;
  rating: string;
  reviewsCount: number;
  stock: number;
  description: string | null;
  featured: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'hidden';
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
};

export type Brand = {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
};

export type User = {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'staff' | 'customer';
  status: 'active' | 'blocked';
};

export type Order = {
  id: number;
  orderCode: string;
  customerId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | 'wallet';
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};
