import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventParty } from './entities/event-party.entity';
import { CreateEventPartyDto } from './dto/create-event-party.dto';
import { UpdateEventPartyDto } from './dto/update-event-party.dto';

@Injectable()
export class EventPartyService {
    constructor(
        @InjectRepository(EventParty)
        private eventPartyRepository: Repository<EventParty>,
    ) {}

    async create(createEventPartyDto: CreateEventPartyDto): Promise<EventParty> {
        const eventParty = this.eventPartyRepository.create(createEventPartyDto);
        return await this.eventPartyRepository.save(eventParty);
    }

    async findAll(): Promise<EventParty[]> {
        return await this.eventPartyRepository.find({
            relations: ['games', 'participants', 'participants.person'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findOne(id: number): Promise<EventParty> {
        const eventParty = await this.eventPartyRepository.findOne({ 
            where: { idEventParty: id },
            relations: ['games', 'participants', 'participants.person']
        });
        if (!eventParty) {
            throw new NotFoundException(`Event party with ID ${id} not found`);
        }
        return eventParty;
    }

    async update(id: number, updateEventPartyDto: UpdateEventPartyDto): Promise<EventParty> {
        const eventParty = await this.findOne(id);
        Object.assign(eventParty, updateEventPartyDto);
        return await this.eventPartyRepository.save(eventParty);
    }

    async remove(id: number): Promise<void> {
        const eventParty = await this.findOne(id);
        await this.eventPartyRepository.remove(eventParty);
    }

    async findWithGames(id: number): Promise<EventParty> {
        const eventParty = await this.eventPartyRepository.findOne({
            where: { idEventParty: id },
            relations: ['games']
        });
        if (!eventParty) {
            throw new NotFoundException(`Event party with ID ${id} not found`);
        }
        return eventParty;
    }

    async findWithParticipants(id: number): Promise<EventParty> {
        const eventParty = await this.eventPartyRepository.findOne({
            where: { idEventParty: id },
            relations: ['participants', 'participants.person']
        });
        if (!eventParty) {
            throw new NotFoundException(`Event party with ID ${id} not found`);
        }
        return eventParty;
    }
} 