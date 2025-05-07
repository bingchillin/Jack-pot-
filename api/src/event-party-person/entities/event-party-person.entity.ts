import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('lnk_participation_person_event_party')
export class EventPartyPerson {
    @PrimaryGeneratedColumn({ name: 'id_lnk_participation_person_event_party' })
    idEventPartyPerson: number;

    @ManyToOne(() => EventParty)
    @JoinColumn({ name: 'id_event_party' })
    eventParty: EventParty;

    @ManyToOne(() => Person)
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 