import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PersonModule } from '../person/person.module';
import { OrderModule } from '../order/order.module';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => PersonModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [StripeController, WebhookController],
  providers: [StripeService, WebhookService],
  exports: [StripeService, WebhookService],
})
export class StripeModule {} 