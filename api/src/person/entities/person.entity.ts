import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { PlantPerson } from 'src/plant-person/entities/plant-person.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { ObjectProfile } from 'src/object-profile/entities/object-profile.entity';
import { Role } from 'src/role/entities/role.entity';
import { Contact } from 'src/contact/entities/contact.entity';
import { EventParty } from 'src/event-party/entities/event-party.entity';
import { Game } from 'src/game/entities/game.entity';
import { GamePerson } from 'src/game-person/entities/game-person.entity';
import { EventPartyPerson } from 'src/event-party-person/entities/event-party-person.entity';
import { PersonParameter } from 'src/lnk-person-parameter/entities/person-parameter.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn({ name: 'id_person' })
  idPerson: number;

  @Column({ length: 250, unique: true, nullable: true })
  @Index()
  email: string;

  @Column({ length: 250, nullable: true })
  firstname: string;

  @Column({ length: 250, nullable: true })
  surname: string;

  @Column({ length: 500 })
  password: string;

  @Column({ name: 'number_phone', length: 50, nullable: true })
  @Index()
  numberPhone: string;

  @Column({ name: 'id_role', nullable: true })
  idRole: number;

  @ManyToOne(() => Role, role => role.persons, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_role' })
  role: Role;

  @Column({ name: 'isEmailVerified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'emailVerificationToken', nullable: true })
  emailVerificationToken: string;

  @Column({ name: 'verificationCode', nullable: true })
  verificationCode: string;

  @Column({ name: 'verificationCodeExpires', nullable: true })
  verificationCodeExpires: Date;

  @Column({ name: 'resetTokenVersion', default: 0 })
  resetTokenVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Contact, contact => contact.person)
  contacts: Contact[];

  @OneToMany(() => EventParty, eventParty => eventParty.person)
  eventParties: EventParty[];

  @OneToMany(() => Game, game => game.winner)
  gamesWon: Game[];

  @OneToMany(() => Game, game => game.loser)
  gamesLost: Game[];

  @OneToMany(() => GamePerson, gamePerson => gamePerson.person)
  gameParticipations: GamePerson[];

  @OneToMany(() => EventPartyPerson, participation => participation.person)
  eventParticipations: EventPartyPerson[];

  @OneToMany(() => PersonParameter, personParameter => personParameter.person)
  parameters: PersonParameter[];

  @OneToMany(() => Notification, notification => notification.person)
  notifications: Notification[];

  @OneToMany(() => ObjectProfile, objectProfile => objectProfile.person)
  objectProfiles: ObjectProfile[];

  @OneToMany(() => Plant, plant => plant.person)
  plants: Plant[];

  @OneToMany(() => PlantPerson, plantPerson => plantPerson.person)
  plantRelations: PlantPerson[];
}