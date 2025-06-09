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

  @Column({ name: 'scientist_name', length: 250, nullable: true })
  scientistName: string;

  @Column({ name: 'family_name', length: 250, nullable: true })
  familyName: string;

  @Column({ name: 'type_name', length: 250, nullable: true })
  typeName: string;

  @Column({ name: 'exposition_type', length: 250, nullable: true })
  expositionType: string;

  @Column({ name: 'ground_type', length: 250, nullable: true })
  groundType: string;

  @Column({ name: 'saison_first', length: 100, nullable: true })
  saisonFirst: string;

  @Column({ name: 'saison_second', length: 100, nullable: true })
  saisonSecond: string;

  @Column({ name: 'saison_third', length: 100, nullable: true })
  saisonThird: string;

  @Column({ name: 'saison_last', length: 100, nullable: true })
  saisonLast: string;

  @Column({ name: 'number_good_saison', nullable: true })
  numberGoodSaison: number;

  @Column({ name: 'plantation_saison', length: 100, nullable: true })
  plantationSaison: string;

  @Column({ name: 'ph_ground_sensor', type: 'decimal', precision: 4, scale: 2, nullable: true })
  phGroundSensor: number;

  @Column({ name: 'ph_min', type: 'decimal', precision: 4, scale: 2, nullable: true })
  phMin: number;

  @Column({ name: 'ph_max', type: 'decimal', precision: 4, scale: 2, nullable: true })
  phMax: number;

  @Column({ name: 'conductivity_electrique_fertility_sensor', type: 'decimal', precision: 6, scale: 2, nullable: true })
  conductivityElectriqueFertilitySensor: number;

  @Column({ name: 'conductivity_electrique_fertility_min', type: 'decimal', precision: 6, scale: 2, nullable: true })
  conductivityElectriqueFertilityMin: number;

  @Column({ name: 'conductivity_electrique_fertility_max', type: 'decimal', precision: 6, scale: 2, nullable: true })
  conductivityElectriqueFertilityMax: number;

  @Column({ name: 'light_sensor', type: 'decimal', precision: 10, scale: 2, nullable: true })
  lightSensor: number;

  @Column({ name: 'temperature_sensor_ground', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureSensorGround: number;

  @Column({ name: 'temperature_sensor_extern', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureSensorExtern: number;

  @Column({ name: 'humidity_air_sensor', type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityAirSensor: number;

  @Column({ name: 'humidity_ground_sensor', type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityGroundSensor: number;

  @Column({ name: 'exposition_time_sun', type: 'decimal', nullable: true })
  expositionTimeSun: number;

  @Column({ name: 'height_min', type: 'decimal', nullable: true })
  heightMin: number;

  @Column({ name: 'height_max', type: 'decimal', nullable: true })
  heightMax: number;

  @Column({ name: 'path_picture', length: 3000, nullable: true })
  pathPicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Avatar, avatar => avatar.plantType)
  avatars: Avatar[];

  @OneToMany(() => ObjectProfile, objectProfile => objectProfile.plantType)
  objectProfiles: ObjectProfile[];
}