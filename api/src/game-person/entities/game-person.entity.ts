import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Game } from '../../game/entities/game.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('game_person')
export class GamePerson {
  @PrimaryGeneratedColumn({ name: 'id_game_person' })
  idGamePerson: number;

  @Column({ name: 'isOwner', default: false })
  @Index()
  isOwner: boolean;

  @Column({ name: 'isPlayer', default: false })
  @Index()
  isPlayer: boolean;

  @Column({ name: 'id_game' })
  idGame: number;

  @ManyToOne(() => Game, game => game.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_game' })
  game: Game;

  @Column({ name: 'id_person' })
  idPerson: number;

  @ManyToOne(() => Person, person => person.gameParticipations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}