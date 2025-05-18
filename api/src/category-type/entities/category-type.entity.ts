import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectEntity } from '../../object/entities/object.entity';

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

    @OneToMany(() => ObjectEntity, object => object.categoryType)
    objects: ObjectEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 