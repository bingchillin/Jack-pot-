import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectEntity } from '../../object/entities/object.entity';
import { PlantType } from '../../plant-type/entities/plant-type.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { Person } from 'src/person/entities/person.entity';

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

  @ManyToOne(() => ObjectEntity, object => object.objectProfiles, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_object' })
  object: ObjectEntity;

  @Column({ name: 'id_plant_type', nullable: true })
  idPlantType: number;

  @ManyToOne(() => PlantType, plantType => plantType.objectProfiles, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_plant_type' })
  plantType: PlantType;

  @Column({ name: 'id_person', nullable: true })
  idPerson: number;

  @ManyToOne(() => Person, person => person.objectProfiles)
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ length: 5000, nullable: true })
  advise: string;

  @Column({ name: 'humidity_air_sensor', type: 'decimal', nullable: true })
  humidityAirSensor: number;

  @Column({ name: 'humidity_ground_sensor', type: 'decimal', nullable: true })
  humidityGroundSensor: number;

  @Column({ name: 'ph_ground_sensor', type: 'decimal', nullable: true })
  phGroundSensor: number;

  @Column({ name: 'conductivity_electrique_fertility_sensor', type: 'decimal', nullable: true })
  conductivityElectriqueFertilitySensor: number;

  @Column({ name: 'light_sensor', type: 'decimal', nullable: true })
  lightSensor: number;

  @Column({ name: 'temperature_sensor_ground', type: 'decimal', nullable: true })
  temperatureSensorGround: number;

  @Column({ name: 'temperature_sensor_extern', type: 'decimal', nullable: true })
  temperatureSensorExtern: number;

  @Column({ name: 'exposition_time_sun', type: 'decimal', nullable: true })
  expositionTimeSun: number;

  @Column({ nullable: true })
  favoris: number;

  @Column({ name: 'is_automatic', nullable: true })
  isAutomatic: boolean;

  @Column({ name: 'is_will_watering', nullable: true })
  isWillWatering: boolean;

  @Column({ default: 0 })
  state: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Plant, plant => plant.objectProfile)
  plants: Plant[];
}