import { CreateOrderRequest, CreateOrderResponse, PaymentStatusResponse, Order } from '@/interfaces/order.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class OrderService {
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

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/create-payment-intent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    
    return this.handleResponse<CreateOrderResponse>(response);
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/confirm-payment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ paymentIntentId }),
    });
    
    return this.handleResponse<PaymentStatusResponse>(response);
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/payment-status/${paymentIntentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<PaymentStatusResponse>(response);
  }

  async getMyOrders(page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<{ orders: Order[]; total: number; page: number; limit: number }>(response);
  }

  async getOrder(orderId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Order>(response);
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/by-payment-intent/${paymentIntentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Order>(response);
  }

  async getOrderBySession(sessionId: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/by-session/${sessionId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Order>(response);
  }

  async getOrderBySessionWithRetry(sessionId: string): Promise<any> {
    try {
      const order = await this.getOrderBySession(sessionId);
      return order;
    } catch (error) {
      // Order not found, create it from session data
      return this.createOrderFromSession(sessionId);
    }
  }

  async createOrderFromSession(sessionId: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/create-from-session/${sessionId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Order>(response);
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Order>(response);
  }

  async createPaymentIntent(orderData: CreateOrderRequest): Promise<{ clientSecret: string; paymentIntentId: string; totalAmount: number }> {
    const response = await fetch(`${API_BASE_URL}/orders/create-payment-intent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    
    return this.handleResponse<{ clientSecret: string; paymentIntentId: string; totalAmount: number }>(response);
  }
}

export const orderService = new OrderService(); 