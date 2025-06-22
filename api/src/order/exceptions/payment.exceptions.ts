import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentProcessingError extends HttpException {
  constructor(message: string = 'Payment processing failed') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'PaymentProcessingError'
    }, HttpStatus.BAD_REQUEST);
  }
}

export class InsufficientFundsError extends HttpException {
  constructor(message: string = 'Insufficient funds for this transaction') {
    super({
      statusCode: HttpStatus.PAYMENT_REQUIRED,
      message,
      error: 'InsufficientFundsError'
    }, HttpStatus.PAYMENT_REQUIRED);
  }
}

export class PaymentMethodError extends HttpException {
  constructor(message: string = 'Invalid or declined payment method') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'PaymentMethodError'
    }, HttpStatus.BAD_REQUEST);
  }
}

export class StripeServiceError extends HttpException {
  constructor(message: string = 'Stripe service error') {
    super({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message,
      error: 'StripeServiceError'
    }, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class PaymentIntentNotFoundError extends HttpException {
  constructor(paymentIntentId: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Payment intent ${paymentIntentId} not found`,
      error: 'PaymentIntentNotFoundError'
    }, HttpStatus.NOT_FOUND);
  }
}

export class PaymentAlreadyProcessedError extends HttpException {
  constructor(message: string = 'Payment has already been processed') {
    super({
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'PaymentAlreadyProcessedError'
    }, HttpStatus.CONFLICT);
  }
}

export class InsufficientStockError extends HttpException {
  constructor(productName: string, requested: number, available: number) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Insufficient stock for ${productName}. Requested: ${requested}, Available: ${available}`,
      error: 'InsufficientStockError'
    }, HttpStatus.BAD_REQUEST);
  }
} 