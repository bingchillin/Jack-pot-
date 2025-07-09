import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartControlService } from './smart-control.service';
import { ObjectProfile } from '../object-profile/entities/object-profile.entity';
import { PlantType } from '../plant-type/entities/plant-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectProfile, PlantType]),
  ],
  providers: [SmartControlService],
  exports: [SmartControlService],
})
export class SmartControlModule {} 