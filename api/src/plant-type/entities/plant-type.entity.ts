import { Avatar } from 'src/avatar/entities/avatar.entity';
import { ObjectProfile } from 'src/object-profile/entities/object-profile.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

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

  @Column({ name: 'family_name', length: 250, nullable: true })
  familyName: string;

  @Column({ name: 'exposition_type', length: 250, nullable: true })
  expositionType: string;

  @Column({ name: 'ph_min', type: 'decimal', precision: 4, scale: 2, nullable: true })
  phMin: number;

  @Column({ name: 'ph_max', type: 'decimal', precision: 4, scale: 2, nullable: true })
  phMax: number;

  @Column({ name: 'conductivity_electrique_fertility_min', type: 'decimal', precision: 6, scale: 2, nullable: true })
  conductivityElectriqueFertilityMin: number;

  @Column({ name: 'conductivity_electrique_fertility_max', type: 'decimal', precision: 6, scale: 2, nullable: true })
  conductivityElectriqueFertilityMax: number;

  @Column({ name: 'temperature_sensor_ground_min', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureSensorGroundMin: number;

  @Column({ name: 'temperature_sensor_ground_max', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureSensorGroundMax: number;

  @Column({ name: 'temperature_sensor_extern_min', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureSensorExternMin: number;

  @Column({ name: 'temperature_sensor_extern_max', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureSensorExternMax: number;

  @Column({ name: 'humidity_air_sensor_min', type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityAirSensorMin: number;

  @Column({ name: 'humidity_air_sensor_max', type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityAirSensorMax: number;

  @Column({ name: 'humidity_ground_sensor_min', type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityGroundSensorMin: number;

  @Column({ name: 'humidity_ground_sensor_max', type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityGroundSensorMax: number;

  @Column({ name: 'light_sensor_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  lightSensorMin: number;

  @Column({ name: 'light_sensor_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  lightSensorMax: number;

  @Column({ name: 'exposition_time_sun_min', type: 'decimal', nullable: true })
  expositionTimeSunMin: number;

  @Column({ name: 'exposition_time_sun_max', type: 'decimal', nullable: true })
  expositionTimeSunMax: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Avatar, avatar => avatar.plantType)
  avatars: Avatar[];

  @OneToMany(() => ObjectProfile, objectProfile => objectProfile.plantType)
  objectProfiles: ObjectProfile[];
}