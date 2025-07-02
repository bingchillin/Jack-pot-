import { Controller, Post, Patch, Get, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnDto } from './dto/return.dto';

@ApiTags('returns')
@Controller('returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a return request for an order' })
  @ApiResponse({ status: 201, description: 'Return request created successfully', type: ReturnDto })
  @ApiResponse({ status: 400, description: 'Bad request - order not eligible for return' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createReturn(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() createReturnDto: CreateReturnDto,
  ): Promise<ReturnDto> {
    return this.returnService.createReturn(orderId, createReturnDto);
  }

  @Patch(':returnId/received')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark return as received and process refund' })
  @ApiResponse({ status: 200, description: 'Return marked as received and refund processed', type: ReturnDto })
  @ApiResponse({ status: 404, description: 'Return not found' })
  @ApiResponse({ status: 400, description: 'Return not in valid status' })
  async markAsReceived(@Param('returnId', ParseIntPipe) returnId: number): Promise<ReturnDto> {
    return this.returnService.markAsReceived(returnId);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get return information for an order' })
  @ApiResponse({ status: 200, description: 'Return information retrieved', type: ReturnDto })
  @ApiResponse({ status: 404, description: 'No return found for this order' })
  async getReturnByOrderId(@Param('orderId', ParseIntPipe) orderId: number): Promise<ReturnDto | null> {
    return this.returnService.getReturnByOrderId(orderId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all returns (admin only)' })
  @ApiResponse({ status: 200, description: 'All returns retrieved', type: [ReturnDto] })
  async getAllReturns(): Promise<ReturnDto[]> {
    return this.returnService.getAllReturns();
  }
} 