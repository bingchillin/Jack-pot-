export enum ReturnStatus {
  REQUESTED = 'requested',
  RECEIVED = 'received'
}

export interface Return {
  idReturn: number;
  idOrder: number;
  status: ReturnStatus;
  reason?: string;
  createdAt: string;
  receivedAt?: string;
  refundedAt?: string;
}

export interface CreateReturnRequest {
  reason?: string;
} 