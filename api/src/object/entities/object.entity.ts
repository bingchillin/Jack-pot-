import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CategoryType } from '../../category-type/entities/category-type.entity';
import { Person } from '../../person/entities/person.entity';
import { ObjectProfile } from '../../object-profile/entities/object-profile.entity';

@Entity('object')
export class ObjectEntity {
    @PrimaryGeneratedColumn({ name: 'id_object' })
    idObject: number;

    @Column({ length: 250, nullable: true })
    title: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column({ length: 5000, nullable: true })
    advise: string;

    @Column({ name: 'id_category_type', nullable: true })
    idCategoryType: number;

    @Column({ name: 'id_person', nullable: true })
    idPerson: number;

    @ManyToOne(() => CategoryType, categoryType => categoryType.objects)
    @JoinColumn({ name: 'id_category_type' })
    categoryType: CategoryType;

    @ManyToOne(() => Person)
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @OneToMany(() => ObjectProfile, objectProfile => objectProfile.object)
    objectProfiles: ObjectProfile[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 