import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlantType } from '../../plant-type/entities/plant-type.entity';

@Entity('avatar')
export class Avatar {
    @PrimaryGeneratedColumn({ name: 'id_avatar' })
    idAvatar: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @Column({ name: 'id_plant_type', nullable: true })
    idPlantType: number;

    @ManyToOne(() => PlantType)
    @JoinColumn({ name: 'id_plant_type' })
    plantType: PlantType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 