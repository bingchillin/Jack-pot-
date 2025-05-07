import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventPartyService } from './event-party.service';
import { EventPartyController } from './event-party.controller';
import { EventParty } from './entities/event-party.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EventParty])],
    controllers: [EventPartyController],
    providers: [EventPartyService],
    exports: [EventPartyService]
})
export class EventPartyModule {} 