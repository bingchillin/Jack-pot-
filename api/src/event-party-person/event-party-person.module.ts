import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventPartyPersonService } from './event-party-person.service';
import { EventPartyPersonController } from './event-party-person.controller';
import { EventPartyPerson } from './entities/event-party-person.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EventPartyPerson])],
    controllers: [EventPartyPersonController],
    providers: [EventPartyPersonService],
    exports: [EventPartyPersonService]
})
export class EventPartyPersonModule {} 