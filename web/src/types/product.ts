export interface ProductImage {
  id?: number;
  imageUrl: string;
  sortOrder: number;
  isPrimary: number;
}

export interface ProductSpec {
  specName: string;
  specValue: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  brand: string;

  price: number;
  originalPrice: number | null;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  description: string | null;
  featured: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'hidden';
  additionalSpecs?: Array<{ name: string; value: string }>;
  images: ProductImage[];
  specs: ProductSpec[];
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface Brand {
  id: number;
  name: string;
  logo?: string;
}
