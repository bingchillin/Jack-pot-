import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Headers, RawBodyRequest, Req, BadRequestException } from '@nestjs/common';
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
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint for payment events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: boolean }> {
    console.log('=== WEBHOOK CONTROLLER ===');
    console.log('Raw body type:', typeof request.rawBody);
    console.log('Raw body is Buffer:', Buffer.isBuffer(request.rawBody));
    console.log('Raw body length:', request.rawBody?.length);
    console.log('Raw body content:', request.rawBody?.toString('utf8'));
    console.log('Signature:', signature);
    
    if (!request.rawBody) {
      console.error('No raw body received!');
      throw new BadRequestException('No raw body received');
    }
    
    return this.orderService.handleWebhook(request.rawBody, signature);
  }

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for order items' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  async createPaymentIntent(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req
  ): Promise<{ clientSecret: string; paymentIntentId: string; totalAmount: number }> {
    // Set the person ID from the authenticated user
    createOrderDto.personId = req.user.idPerson;
    return this.orderService.createPaymentIntent(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiResponse({ status: 200, description: 'List of orders', type: [Order] })
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'List of user orders', type: [Order] })
  findMyOrders(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.orderService.findByPerson(req.user.idPerson, pageNum, limitNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(+id);
  }

  @Get('by-payment-intent/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an order by payment intent ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findByPaymentIntent(@Param('paymentIntentId') paymentIntentId: string): Promise<Order> {
    return this.orderService.findByPaymentIntent(paymentIntentId);
  }

  @Get('by-session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an order by Stripe session ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findBySession(@Param('sessionId') sessionId: string): Promise<Order> {
    return this.orderService.findBySession(sessionId);
  }

  @Post('create-from-session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an order from Stripe session data' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Invalid session data' })
  createFromSession(@Param('sessionId') sessionId: string): Promise<Order> {
    return this.orderService.createFromSession(sessionId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully', type: Order })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: Order })
  updateStatus(@Param('id') id: string, @Body('status') status: string): Promise<Order> {
    return this.orderService.updateStatus(+id, status as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Cannot cancel this order' })
  cancelOrder(@Param('id') id: string): Promise<Order> {
    return this.orderService.cancelOrder(+id);
  }
} 