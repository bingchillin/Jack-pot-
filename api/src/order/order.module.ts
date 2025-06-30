import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Person } from '../person/entities/person.entity';
import { PersonModule } from '../person/person.module';
import { StripeModule } from '../stripe/stripe.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Person]),
    forwardRef(() => PersonModule),
    forwardRef(() => StripeModule),
    MailerModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {} 