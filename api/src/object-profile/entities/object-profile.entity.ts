import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectEntity } from '../../object/entities/object.entity';
import { PlantType } from '../../plant-type/entities/plant-type.entity';

@Entity('object_profile')
export class ObjectProfile {
    @PrimaryGeneratedColumn({ name: 'id_object_profile' })
    idObjectProfile: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ name: 'id_object', nullable: true })
    idObject: number;

    @ManyToOne(() => ObjectEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_object' })
    object: ObjectEntity;

    @Column({ name: 'id_plant_type', nullable: true })
    idPlantType: number;

    @ManyToOne(() => PlantType, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_plant_type' })
    plantType: PlantType;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 