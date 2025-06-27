import { Product } from './product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  currency: string;
} 