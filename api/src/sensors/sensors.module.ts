import { Module } from '@nestjs/common';
import { SensorsController } from './sensors.controller';
import { NotificationModule } from '../notification/notification.module';
import { ObjectProfileModule } from '../object-profile/object-profile.module';

@Module({
  imports: [
    NotificationModule,
    ObjectProfileModule,
  ],
  controllers: [SensorsController],
})
export class SensorsModule {} 