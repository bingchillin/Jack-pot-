import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('avatar')
export class Avatar {
    @PrimaryGeneratedColumn({ name: 'id_avatar' })
    idAvatar: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ name: 'id_plant_type', nullable: true })
    idPlantType: number;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @Column({ length: 3000, nullable: true })
    path_picture: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 