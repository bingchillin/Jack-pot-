import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectProfile } from '../../object-profile/entities/object-profile.entity';

@Entity('plant_care_score')
export class PlantCareScore {
  @PrimaryGeneratedColumn({ name: 'id_plant_care_score' })
  idPlantCareScore: number;

  @Column({ name: 'id_object_profile' })
  @Index()
  idObjectProfile: number;

  @ManyToOne(() => ObjectProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_object_profile' })
  objectProfile: ObjectProfile;

  @Column({ type: 'date' })
  @Index()
  scoreDate: Date;

  @Column({ type: 'int', default: 0 })
  dailyScore: number;

  @Column({ type: 'int', default: 0 })
  weeklyScore: number;

  @Column({ type: 'int', default: 0 })
  moistureScore: number;

  @Column({ type: 'int', default: 0 })
  temperatureScore: number;

  @Column({ type: 'int', default: 0 })
  lightScore: number;

  @Column({ type: 'int', default: 0 })
  phScore: number;

  @Column({ type: 'int', default: 0 })
  consistencyBonus: number;

  @Column({ type: 'int', default: 0 })
  improvementBonus: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dailyMessage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  weeklyMessage: string;

  @Column({ type: 'json', nullable: true })
  sensorData: any;

  @Column({ type: 'boolean', default: false })
  isPerfectDay: boolean;

  @Column({ type: 'boolean', default: false })
  isPerfectWeek: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 