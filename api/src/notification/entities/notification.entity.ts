import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
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

    @ManyToOne(() => Person, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @Column({ name: 'id_object', nullable: true })
    idObject: number;

    @ManyToOne(() => ObjectEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_object' })
    object: ObjectEntity;

    @Index()
    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 