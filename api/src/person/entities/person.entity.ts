import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';
import { Contact } from '../../contact/entities/contact.entity';
import { PersonParameter } from '../../lnk-person-parameter/entities/person-parameter.entity';
import { ObjectEntity } from '../../object/entities/object.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { EventPartyPerson } from '../../event-party-person/entities/event-party-person.entity';

@Entity('person')
export class Person {
    @PrimaryGeneratedColumn({ name: 'id_person' })
    idPerson: number;

    @Column({ length: 250, nullable: false })
    mail: string;

    @Column({ length: 250, nullable: false })
    firstname: string;

    @Column({ length: 250, nullable: false })
    surname: string;

    @Column({ length: 500, nullable: false })
    @Exclude()
    password: string;

    @Column({ length: 50, nullable: true, name: 'number_phone' })
    numberPhone: string;

    @ManyToOne(() => Role, role => role.persons)
    @JoinColumn({ name: 'id_role' })
    role: Role;

    @OneToMany(() => Contact, contact => contact.person)
    contacts: Contact[];

    @OneToMany(() => PersonParameter, personParameter => personParameter.person)
    personParameters: PersonParameter[];

    @OneToMany(() => ObjectEntity, object => object.person)
    objects: ObjectEntity[];

    @OneToMany(() => Notification, notification => notification.person)
    notifications: Notification[];

    @OneToMany(() => EventPartyPerson, eventPartyPerson => eventPartyPerson.person)
    eventPartyParticipations: EventPartyPerson[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 