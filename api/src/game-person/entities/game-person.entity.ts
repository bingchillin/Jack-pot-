import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Game } from '../../game/entities/game.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('game_person')
export class GamePerson {
    @PrimaryGeneratedColumn({ name: 'id_game_person' })
    idGamePerson: number;

    @ManyToOne(() => Game)
    @JoinColumn({ name: 'id_game' })
    game: Game;

    @ManyToOne(() => Person)
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @Column({ default: false })
    isOwner: boolean;

    @Column({ default: false })
    isPlayer: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 