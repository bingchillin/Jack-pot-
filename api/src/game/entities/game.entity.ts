import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { GamePerson } from '../../game-person/entities/game-person.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('game')
export class Game {
    @PrimaryGeneratedColumn({ name: 'id_game' })
    idGame: number;

    @Column({ length: 250 })
    title: string;

    @Column({ length: 5000 })
    description: string;

    @Column({ name: 'id_won', nullable: true })
    idWon: number;

    @Column({ name: 'id_lose', nullable: true })
    idLose: number;

    @Column({ type: 'date', nullable: true })
    beginDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ length: 5000, nullable: true })
    rules: string;

    @Column({ name: 'id_event_party', nullable: true })
    idEventParty: number;

    @ManyToOne(() => EventParty, eventParty => eventParty.games, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_event_party' })
    eventParty: EventParty;

    @ManyToOne(() => Person, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_won' })
    winner: Person;

    @ManyToOne(() => Person, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_lose' })
    loser: Person;

    @OneToMany(() => GamePerson, gamePerson => gamePerson.game)
    players: GamePerson[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 