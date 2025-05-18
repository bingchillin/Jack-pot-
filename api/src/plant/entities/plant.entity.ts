import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { ObjectEntity } from '../../object/entities/object.entity';

@Entity('plant')
export class Plant {
    @PrimaryGeneratedColumn({ name: 'id_plant' })
    idPlant: number;

    @Index()
    @Column({ length: 100, nullable: true })
    name: string;

    @Column({ length: 500, nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Index()
    @Column({ length: 50, nullable: true })
    category: string;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ name: 'id_person', nullable: true })
    idPerson: number;

    @ManyToOne(() => Person, person => person.plants, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @Column({ name: 'id_object', nullable: true })
    idObject: number;

    @ManyToOne(() => ObjectEntity, object => object.plants, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_object' })
    object: ObjectEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 