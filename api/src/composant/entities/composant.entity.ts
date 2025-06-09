import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectEntity } from '../../object/entities/object.entity';

@Entity('composant')
export class Composant {
  @PrimaryGeneratedColumn({ name: 'id_composant' })
  idComposant: number;

  @Column({ length: 250, nullable: true })
  title: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ length: 5000, nullable: true })
  advise: string;

  @Column({ name: 'id_object', nullable: true })
  idObject: number;

  @ManyToOne(() => ObjectEntity, object => object.composants)
  @JoinColumn({ name: 'id_object' })
  object: ObjectEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}