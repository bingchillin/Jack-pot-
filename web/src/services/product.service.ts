import { Product, ProductListResponse, ProductFilters } from '@/interfaces/product.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ProductService {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters?.minPrice !== undefined) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters?.maxPrice !== undefined) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const url = `${API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Product[]>(response);
  }

  async getProductById(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Product>(response);
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.getAllProducts({ isActive: true });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.getAllProducts({ search: query, isActive: true });
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.getAllProducts({ 
      minPrice, 
      maxPrice, 
      isActive: true 
    });
  }
}

export const productService = new ProductService(); 