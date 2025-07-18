import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PlantCareScore } from '../plant-care-score/entities/plant-care-score.entity';
import { ObjectProfile } from '../object-profile/entities/object-profile.entity';
import { Person } from '../person/entities/person.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantCareScore, ObjectProfile, Person]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {} 