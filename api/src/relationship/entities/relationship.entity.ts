import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contact } from '../../contact/entities/contact.entity';

@Entity('relationship')
export class Relationship {
    @PrimaryGeneratedColumn({ name: 'id_relationship' })
    idRelationship: number;

    @Column({ length: 250, nullable: false })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @OneToMany(() => Contact, contact => contact.relationship)
    contacts: Contact[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 