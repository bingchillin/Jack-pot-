import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { GamePerson } from '../../game-person/entities/game-person.entity';

@Entity('game')
export class Game {
    @PrimaryGeneratedColumn({ name: 'id_game' })
    idGame: number;

    @Column({ length: 250 })
    title: string;

    @Column({ length: 5000 })
    description: string;

    @Column({ nullable: true })
    idWon: number;

    @Column({ nullable: true })
    idLose: number;

    @Column({ type: 'date', nullable: true })
    beginDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ length: 5000, nullable: true })
    rules: string;

    @ManyToOne(() => EventParty)
    @JoinColumn({ name: 'id_event_party' })
    eventParty: EventParty;

    @OneToMany(() => GamePerson, gamePerson => gamePerson.game)
    players: GamePerson[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 