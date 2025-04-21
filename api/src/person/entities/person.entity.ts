import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

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

    @Column({ name: 'id_role', nullable: true })
    idRole: number;
} 