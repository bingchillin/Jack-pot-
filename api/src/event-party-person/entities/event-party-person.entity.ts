import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('lnk_participation_person_event_party')
export class EventPartyPerson {
    @PrimaryGeneratedColumn({ name: 'id_lnk_participation_person_event_party' })
    idLnkParticipationPersonEventParty: number;
  
    @Column({ name: 'id_person', nullable: true })
    idPerson: number;
  
    @ManyToOne(() => Person, person => person.eventParticipations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_person' })
    person: Person;
  
    @Column({ name: 'id_event_party', nullable: true })
    idEventParty: number;
  
    @ManyToOne(() => EventParty, eventParty => eventParty.participations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_event_party' })
    eventParty: EventParty;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }