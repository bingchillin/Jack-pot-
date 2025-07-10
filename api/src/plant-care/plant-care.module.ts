import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantCareService } from './plant-care.service';
import { ObjectProfile } from '../object-profile/entities/object-profile.entity';
import { PlantType } from '../plant-type/entities/plant-type.entity';
import { NotificationModule } from '../notification/notification.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectProfile, PlantType]),
    NotificationModule,
    PersonModule,
  ],
  providers: [PlantCareService],
  exports: [PlantCareService],
})
export class PlantCareModule {} 