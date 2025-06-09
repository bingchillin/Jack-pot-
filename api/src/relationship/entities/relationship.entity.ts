import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('relationship')
export class Relationship {
    @PrimaryGeneratedColumn({ name: 'id_relationship' })
    idRelationship: number;

    @Index({ unique: true })
    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 