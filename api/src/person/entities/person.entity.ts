import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';
import { Contact } from '../../contact/entities/contact.entity';
import { PersonParameter } from '../../lnk-person-parameter/entities/person-parameter.entity';
import { ObjectEntity } from '../../object/entities/object.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { EventPartyPerson } from '../../event-party-person/entities/event-party-person.entity';
import { GamePerson } from '../../game-person/entities/game-person.entity';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { Plant } from '../../plant/entities/plant.entity';

@Entity('person')
export class Person {
    @PrimaryGeneratedColumn({ name: 'id_person' })
    idPerson: number;

    @Index({ unique: true })
    @Column({ length: 250, nullable: true })
    email: string;

    @Column({ length: 250, nullable: true })
    firstname: string;

    @Column({ length: 250, nullable: true })
    surname: string;

    @Column({ length: 500, nullable: false })
    @Exclude()
    password: string;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ nullable: true })
    emailVerificationToken: string;

    @Column({ nullable: true })
    verificationCode: string;

    @Column({ nullable: true })
    verificationCodeExpires: Date;

    @Index()
    @Column({ length: 50, nullable: true, name: 'number_phone' })
    numberPhone: string;

    @Column({ name: 'id_role', nullable: true })
    idRole: number;

    @ManyToOne(() => Role, role => role.persons, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_role' })
    role: Role;

    @OneToMany(() => Contact, contact => contact.person, { onDelete: 'CASCADE' })
    contacts: Contact[];

    @OneToMany(() => PersonParameter, personParameter => personParameter.person, { onDelete: 'CASCADE' })
    personParameters: PersonParameter[];

    @OneToMany(() => ObjectEntity, object => object.person, { onDelete: 'SET NULL' })
    objects: ObjectEntity[];

    @OneToMany(() => Notification, notification => notification.person, { onDelete: 'CASCADE' })
    notifications: Notification[];

    @OneToMany(() => EventPartyPerson, eventPartyPerson => eventPartyPerson.person, { cascade: true })
    eventPartyPersons: EventPartyPerson[];

    @OneToMany(() => EventParty, eventParty => eventParty.person)
    eventParties: EventParty[];

    @OneToMany(() => GamePerson, gamePerson => gamePerson.person, { onDelete: 'CASCADE' })
    gameParticipations: GamePerson[];

    @OneToMany(() => Plant, plant => plant.person)
    plants: Plant[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 