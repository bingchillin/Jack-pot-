import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentStatusResponseDto } from './dto/payment-status-response.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: CreateOrderResponseDto })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req): Promise<CreateOrderResponseDto> {
    // Set the person ID from the authenticated user
    createOrderDto.personId = req.user.idPerson;
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiResponse({ status: 200, description: 'List of orders', type: [Order] })
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'List of user orders', type: [Order] })
  findMyOrders(@Request() req): Promise<Order[]> {
    return this.orderService.findByPerson(req.user.idPerson);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully', type: Order })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: Order })
  updateStatus(@Param('id') id: string, @Body('status') status: string): Promise<Order> {
    return this.orderService.updateStatus(+id, status as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.orderService.remove(+id);
  }

  @Post('confirm-payment')
  @ApiOperation({ summary: 'Confirm payment for an order' })
  @ApiResponse({ status: 200, description: 'Payment confirmation result', type: PaymentStatusResponseDto })
  @ApiResponse({ status: 400, description: 'Payment processing failed' })
  confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto): Promise<PaymentStatusResponseDto> {
    return this.orderService.confirmPayment(confirmPaymentDto);
  }

  @Get('payment-status/:paymentIntentId')
  @ApiOperation({ summary: 'Get payment status by payment intent ID' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved', type: PaymentStatusResponseDto })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  getPaymentStatus(@Param('paymentIntentId') paymentIntentId: string): Promise<PaymentStatusResponseDto> {
    return this.orderService.getPaymentStatus(paymentIntentId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Cannot cancel this order' })
  cancelOrder(@Param('id') id: string): Promise<Order> {
    return this.orderService.cancelOrder(+id);
  }
} 