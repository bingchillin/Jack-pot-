import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantCareService } from './plant-care.service';
import { PlantHealthCalculationService } from './plant-health-calculation.service';
import { PlantCareController } from './plant-care.controller';
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
  controllers: [PlantCareController],
  providers: [PlantCareService, PlantHealthCalculationService],
  exports: [PlantCareService, PlantHealthCalculationService],
})
export class PlantCareModule {} 