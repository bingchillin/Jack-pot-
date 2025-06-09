import { PlantType } from 'src/plant-type/entities/plant-type.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';

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

  @ManyToOne(() => PlantType, plantType => plantType.avatars)
  @JoinColumn({ name: 'id_plant_type' })
  plantType: PlantType;

  @Column({ length: 5000, nullable: true })
  advise: string;

  @Column({ name: 'path_picture', length: 3000, nullable: true })
  pathPicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}