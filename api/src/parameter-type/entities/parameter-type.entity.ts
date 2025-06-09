import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('parameter_type')
export class ParameterType {
    @PrimaryGeneratedColumn({ name: 'id_parameter_type' })
    idParameterType: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 