import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Relationship } from '../../relationship/entities/relationship.entity';

@Entity('contact')
export class Contact {
    @PrimaryGeneratedColumn({ name: 'id_contact' })
    idContact: number;

    @Column({ length: 250, nullable: true })
    relation: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Index()
    @Column({ default: false })
    isActive: boolean;

    @Column({ length: 100, nullable: true, name: 'value_return' })
    valueReturn: string;

    @ManyToOne(() => Person, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @ManyToOne(() => Relationship, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_relationship' })
    relationship: Relationship;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 