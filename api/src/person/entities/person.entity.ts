import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';

@Entity('person')
export class Person {
    @PrimaryGeneratedColumn({ name: 'id_person' })
    idPerson: number;

    @Column({ length: 250 })
    mail: string;

    @Column({ length: 250 })
    firstname: string;

    @Column({ length: 250 })
    surname: string;

    @Column({ length: 500 })
    @Exclude()
    password: string;

    @Column({ length: 50, nullable: true, name: 'number_phone' })
    numberPhone: string;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'id_role' })
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 