import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plant_type')
export class PlantType {
    @PrimaryGeneratedColumn({ name: 'id_plant_type' })
    idPlantType: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @Column({ length: 250, nullable: true })
    scientist_name: string;

    @Column({ length: 250, nullable: true })
    family_name: string;

    @Column({ length: 250, nullable: true })
    type_name: string;

    @Column({ length: 250, nullable: true })
    exposition_type: string;

    @Column({ length: 250, nullable: true })
    ground_type: string;

    @Column({ length: 100, nullable: true })
    saison_first: string;

    @Column({ length: 100, nullable: true })
    saison_second: string;

    @Column({ length: 100, nullable: true })
    saison_third: string;

    @Column({ length: 100, nullable: true })
    saison_last: string;

    @Column({ type: 'integer', nullable: true })
    number_good_saison: number;

    @Column({ length: 100, nullable: true })
    plantation_saison: string;

    @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
    ph_ground_sensor: number;

    @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
    ph_min: number;

    @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
    ph_max: number;

    @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
    conductivity_electrique_fertility_sensor: number;

    @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
    conductivity_electrique_fertility_min: number;

    @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
    conductivity_electrique_fertility_max: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    light_sensor: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    temperature_sensor_ground: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    temperature_sensor_extern: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    humidity_air_sensor: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    humidity_ground_sensor: number;

    @Column({ type: 'numeric', nullable: true })
    exposition_time_sun: number;

    @Column({ type: 'numeric', nullable: true })
    height_min: number;

    @Column({ type: 'numeric', nullable: true })
    height_max: number;

    @Column({ length: 3000, nullable: true })
    path_picture: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 