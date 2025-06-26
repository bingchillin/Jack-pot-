export interface Product {
  idProduct: number;
  name: string;
  description: string | null;
  price: number | string; // Can be number or string from API
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  isActive: boolean;
  imageUrl: string | null;
  stockQuantity: number;
  reservedQuantity: number;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper function to safely get product price as number
export const getProductPrice = (product: Product): number => {
  return typeof product.price === 'string' ? parseFloat(product.price) : product.price;
};

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductFilters {
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
} 