import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationLocalizationService } from './notification-localization.service';
import { Notification } from './entities/notification.entity';
import { Person } from '../person/entities/person.entity';
import { FirebaseModule } from '../firebase/firebase.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Person]),
    forwardRef(() => FirebaseModule),
    forwardRef(() => PersonModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationLocalizationService],
  exports: [NotificationService, NotificationLocalizationService],
})
export class NotificationModule {} 