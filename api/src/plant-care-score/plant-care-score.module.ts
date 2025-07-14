import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantCareScoreService } from './plant-care-score.service';
import { PlantCareScoreController } from './plant-care-score.controller';
import { PlantCareScore } from './entities/plant-care-score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlantCareScore])],
  controllers: [PlantCareScoreController],
  providers: [PlantCareScoreService],
  exports: [PlantCareScoreService],
})
export class PlantCareScoreModule {} 