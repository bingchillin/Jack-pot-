import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('event_party')
export class EventParty {
    @PrimaryGeneratedColumn({ name: 'id_event_party' })
    idEventParty: number;

    @Column({ length: 250 })
    title: string;

    @Column({ length: 5000 })
    description: string;

    @Column({ default: false })
    isLaunch: boolean;

    @Column({ type: 'date', nullable: true })
    beginDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ length: 5000, nullable: true })
    rules: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 