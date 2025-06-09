import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { ObjectProfile } from 'src/object-profile/entities/object-profile.entity';
import { PlantPerson } from 'src/plant-person/entities/plant-person.entity';

@Entity('plant')
export class Plant {
  @PrimaryGeneratedColumn({ name: 'id_plant' })
  idPlant: number;

  @Column({ length: 100, nullable: true })
  @Index()
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ length: 50, nullable: true })
  @Index()
  category: string;

  @Column({ name: 'isAvailable', default: true })
  isAvailable: boolean;

  @Column({ name: 'id_person', nullable: true })
  idPerson: number;

  @ManyToOne(() => Person, person => person.plants, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ name: 'id_object_profile', nullable: true })
  idObjectProfile: number;

  @ManyToOne(() => ObjectProfile, objectProfile => objectProfile.plants, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_object_profile' })
  objectProfile: ObjectProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PlantPerson, plantPerson => plantPerson.plant)
  plantRelations: PlantPerson[];
}