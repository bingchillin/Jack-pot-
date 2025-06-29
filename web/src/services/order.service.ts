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

  async getOrderBySessionWithRetry(sessionId: string, maxRetries: number = 3): Promise<Order> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // First try to get existing order (webhook might have created it)
        const order = await this.getOrderBySession(sessionId);
        console.log(`Order found on attempt ${attempt + 1}`);
        return order;
      } catch (error) {
        // If order doesn't exist, try to create it from session
        try {
          const createdOrder = await this.createOrderFromSession(sessionId);
          console.log(`Order created successfully on attempt ${attempt + 1}`);
          return createdOrder;
        } catch (createError) {
          console.log(`Attempt ${attempt + 1}: Order not ready yet...`);
          
          // If this is not the last attempt, wait a moment before retrying
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }
    
    // If all attempts failed, throw a helpful error
    throw new Error(`Order is still being processed. Please refresh the page in a few seconds.`);
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