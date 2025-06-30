import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PersonModule } from '../person/person.module';
import { OrderModule } from '../order/order.module';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => PersonModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {} 