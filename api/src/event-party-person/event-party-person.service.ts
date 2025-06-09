import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { EventPartyPerson } from './entities/event-party-person.entity';
import { CreateEventPartyPersonDto } from './dto/create-event-party-person.dto';
import { UpdateEventPartyPersonDto } from './dto/update-event-party-person.dto';

@Injectable()
export class EventPartyPersonService {
    constructor(
        @InjectRepository(EventPartyPerson)
        private eventPartyPersonRepository: Repository<EventPartyPerson>,
    ) {}

    async create(createEventPartyPersonDto: CreateEventPartyPersonDto): Promise<EventPartyPerson> {
        const eventPartyPerson = this.eventPartyPersonRepository.create(createEventPartyPersonDto as DeepPartial<EventPartyPerson>);
        return await this.eventPartyPersonRepository.save(eventPartyPerson);
    }

    async findAll(): Promise<EventPartyPerson[]> {
        return await this.eventPartyPersonRepository.find({
            relations: ['eventParty', 'person']
        });
    }

    async findOne(id: number): Promise<EventPartyPerson> {
        const eventPartyPerson = await this.eventPartyPersonRepository.findOne({ 
            where: { idLnkParticipationPersonEventParty: id },
            relations: ['eventParty', 'person']
        });
        if (!eventPartyPerson) {
            throw new NotFoundException(`Event Party-Person relationship with ID ${id} not found`);
        }
        return eventPartyPerson;
    }

    async update(id: number, updateEventPartyPersonDto: UpdateEventPartyPersonDto): Promise<EventPartyPerson> {
        const eventPartyPerson = await this.findOne(id);
        Object.assign(eventPartyPerson, updateEventPartyPersonDto);
        return await this.eventPartyPersonRepository.save(eventPartyPerson);
    }

    async remove(id: number): Promise<void> {
        const eventPartyPerson = await this.findOne(id);
        await this.eventPartyPersonRepository.remove(eventPartyPerson);
    }

    async findByEventPartyId(eventPartyId: number): Promise<EventPartyPerson[]> {
        return await this.eventPartyPersonRepository.find({
            where: { eventParty: { idEventParty: eventPartyId } },
            relations: ['eventParty', 'person']
        });
    }

    async findByPersonId(personId: number): Promise<EventPartyPerson[]> {
        return await this.eventPartyPersonRepository.find({
            where: { person: { idPerson: personId } },
            relations: ['eventParty', 'person']
        });
    }
} 