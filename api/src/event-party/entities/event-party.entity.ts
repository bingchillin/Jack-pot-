import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Game } from '../../game/entities/game.entity';
import { EventPartyPerson } from '../../event-party-person/entities/event-party-person.entity';

@Entity('event_party')
export class EventParty {
    @PrimaryGeneratedColumn({ name: 'id_event_party' })
    idEventParty: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 5000, nullable: true })
    description: string;

    @Column({ name: 'is_launch', default: false })
    isLaunch: boolean;

    @Column({ name: 'begin_date', type: 'date', nullable: true })
    beginDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ length: 5000, nullable: true })
    rules: string;

    @OneToMany(() => Game, game => game.eventParty)
    games: Game[];

    @OneToMany(() => EventPartyPerson, eventPartyPerson => eventPartyPerson.eventParty)
    participants: EventPartyPerson[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 