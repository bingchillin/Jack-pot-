import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { ObjectEntity } from '../../object/entities/object.entity';
import { Game } from '../../game/entities/game.entity';
import { EventPartyPerson } from '../../event-party-person/entities/event-party-person.entity';

@Entity('event_party')
export class EventParty {
  @PrimaryGeneratedColumn({ name: 'id_event_party' })
  idEventParty: number;

  @Column({ length: 250, nullable: true })
  @Index()
  title: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ length: 250, nullable: true })
  location: string;

  @Column({ name: 'id_person', nullable: true })
  idPerson: number;

  @ManyToOne(() => Person, person => person.eventParties, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ name: 'id_object', nullable: true })
  idObject: number;

  @ManyToOne(() => ObjectEntity, object => object.eventParties, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_object' })
  object: ObjectEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Game, game => game.eventParty)
  games: Game[];

  @OneToMany(() => EventPartyPerson, participation => participation.eventParty)
  participations: EventPartyPerson[];
}