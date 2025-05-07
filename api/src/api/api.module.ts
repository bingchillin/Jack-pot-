import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import {AuthModule} from "../auth/auth.module";
import { PersonModule } from '../person/person.module';
import { PlantModule } from '../plant/plant.module';
import { EventPartyModule } from '../event-party/event-party.module';
import { GameModule } from '../game/game.module';
import { PlantPersonModule } from '../plant-person/plant-person.module';

@Module({
  controllers: [ApiController],
  providers: [ApiService],
  imports: [AuthModule, PersonModule, PlantModule, EventPartyModule, GameModule, PlantPersonModule]
})
export class ApiModule { }
