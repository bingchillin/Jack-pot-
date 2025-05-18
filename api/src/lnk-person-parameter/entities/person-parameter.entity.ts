import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { ParameterType } from '../../parameter-type/entities/parameter-type.entity';

@Entity('lnk_person_parameter')
export class PersonParameter {
    @PrimaryGeneratedColumn({ name: 'id_lnk_person_parameter' })
    idPersonParameter: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @Column({ name: 'id_person', nullable: true })
    idPerson: number;

    @ManyToOne(() => Person, person => person.personParameters, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @Column({ name: 'id_parameter_type', nullable: true })
    idParameterType: number;

    @ManyToOne(() => ParameterType, parameterType => parameterType.personParameters, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_parameter_type' })
    parameterType: ParameterType;

    @Column({ type: 'float', nullable: true })
    value: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 