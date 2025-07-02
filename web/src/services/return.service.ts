import { Return, CreateReturnRequest } from '@/interfaces/return.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ReturnService {
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async createReturn(orderId: number, data: CreateReturnRequest): Promise<Return> {
    const response = await fetch(`${API_BASE_URL}/returns/order/${orderId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Return>(response);
  }

  async getReturnByOrderId(orderId: number): Promise<Return | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/returns/order/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (response.status === 404) {
        return null;
      }
      
      return this.handleResponse<Return>(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async markAsReceived(returnId: number): Promise<Return> {
    const response = await fetch(`${API_BASE_URL}/returns/${returnId}/received`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Return>(response);
  }

  async getAllReturns(): Promise<Return[]> {
    const response = await fetch(`${API_BASE_URL}/returns`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Return[]>(response);
  }
}

export const returnService = new ReturnService(); 