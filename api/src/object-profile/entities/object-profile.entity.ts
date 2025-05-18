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

    @Column({ length: 5000, nullable: true })
    advise: string;

    @Column({ name: 'id_object', nullable: true })
    idObject: number;

    @Column({ name: 'id_plant_type', nullable: true })
    idPlantType: number;

    @ManyToOne(() => ObjectEntity, object => object.objectProfiles)
    @JoinColumn({ name: 'id_object' })
    object: ObjectEntity;

    @ManyToOne(() => PlantType, plantType => plantType.objectProfiles)
    @JoinColumn({ name: 'id_plant_type' })
    plantType: PlantType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 