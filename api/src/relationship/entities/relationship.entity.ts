import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Contact } from '../../contact/entities/contact.entity';

@Entity('relationship')
export class Relationship {
    @PrimaryGeneratedColumn({ name: 'id_relationship' })
    idRelationship: number;

    @Index({ unique: true })
    @Column({ length: 250, nullable: true })
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