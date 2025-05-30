import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Game } from '../../game/entities/game.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('game_person')
export class GamePerson {
    @PrimaryGeneratedColumn({ name: 'id_game_person' })
    idGamePerson: number;

    @Column({ name: 'id_game', nullable: false })
    idGame: number;

    @Column({ name: 'id_person', nullable: false })
    idPerson: number;

    @ManyToOne(() => Game, game => game.players, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_game' })
    game: Game;

    @ManyToOne(() => Person, person => person.gameParticipations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @Index()
    @Column({ default: false })
    isOwner: boolean;

    @Index()
    @Column({ default: false })
    isPlayer: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 