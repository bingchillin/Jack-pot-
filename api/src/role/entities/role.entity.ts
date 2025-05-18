import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Person } from '../../person/entities/person.entity';

@Entity('role')
export class Role {
    @PrimaryGeneratedColumn({ name: 'id_role' })
    idRole: number;

    @Column({ length: 250, unique: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @OneToMany(() => Person, person => person.role)
    persons: Person[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 