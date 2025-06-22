import { Controller, Get, Post, Body, UseGuards, Param, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { PersonService } from '../person/person.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Stripe service status' })
  @ApiResponse({ status: 200, description: 'Stripe service status' })
  getStatus() {
    const status = this.stripeService.getStripeStatus();
    return {
      ...status,
      message: status.initialized 
        ? 'Stripe service is ready' 
        : status.hasKey 
          ? 'Stripe key found but service failed to initialize' 
          : 'No Stripe key found in environment variables'
    };
  }


} 