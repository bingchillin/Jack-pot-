import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ReturnService } from './return.service';
import { ReturnController } from './return.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Return } from './entities/return.entity';
import { Product } from '../product/entities/product.entity';
import { Person } from '../person/entities/person.entity';
import { PersonModule } from '../person/person.module';
import { StripeModule } from '../stripe/stripe.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Return, Product, Person]),
    forwardRef(() => PersonModule),
    forwardRef(() => StripeModule),
    MailerModule,
  ],
  controllers: [OrderController, ReturnController],
  providers: [OrderService, ReturnService],
  exports: [OrderService, ReturnService],
})
export class OrderModule {} 