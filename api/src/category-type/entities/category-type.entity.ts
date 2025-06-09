import { ObjectEntity } from 'src/object/entities/object.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('category_type')
export class CategoryType {
  @PrimaryGeneratedColumn({ name: 'id_category_type' })
  idCategoryType: number;

  @Column({ length: 250, nullable: true })
  title: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ length: 5000, nullable: true })
  advise: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ObjectEntity, object => object.categoryType)
  objects: ObjectEntity[];
}