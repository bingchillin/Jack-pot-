import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { ObjectEntity } from '../../object/entities/object.entity';

@Entity('notification')
export class Notification {
    @PrimaryGeneratedColumn({ name: 'id_notification' })
    idNotification: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @Column({ name: 'id_person', nullable: true })
    idPerson: number;

    @ManyToOne(() => Person)
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @Column({ name: 'id_object', nullable: true })
    idObject: number;

    @ManyToOne(() => ObjectEntity)
    @JoinColumn({ name: 'id_object' })
    object: ObjectEntity;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 