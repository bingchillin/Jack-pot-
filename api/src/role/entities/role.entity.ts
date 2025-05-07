import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('role')
export class Role {
    @PrimaryGeneratedColumn({ name: 'id_role' })
    idRole: number;

    @Column({ length: 250 })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;
} 