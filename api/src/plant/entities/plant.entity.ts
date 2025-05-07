import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Person } from '../../person/entities/person.entity';

@Entity('plant')
export class Plant {
    @PrimaryGeneratedColumn({ name: 'id_plant' })
    idPlant: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 500 })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ length: 50 })
    category: string;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ name: 'id_person', nullable: true })
    idPerson: number;

    @ManyToOne(() => Person)
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 