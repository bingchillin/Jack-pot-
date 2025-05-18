import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { CategoryType } from '../../category-type/entities/category-type.entity';
import { Person } from '../../person/entities/person.entity';
import { ObjectProfile } from '../../object-profile/entities/object-profile.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { Composant } from '../../composant/entities/composant.entity';

@Entity('object')
export class ObjectEntity {
    @PrimaryGeneratedColumn({ name: 'id_object' })
    idObject: number;

    @Index()
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

    @ManyToOne(() => CategoryType, categoryType => categoryType.objects, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_category_type' })
    categoryType: CategoryType;

    @ManyToOne(() => Person, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @OneToMany(() => ObjectProfile, objectProfile => objectProfile.object, { onDelete: 'CASCADE' })
    objectProfiles: ObjectProfile[];

    @OneToMany(() => Plant, plant => plant.object, { cascade: true })
    plants: Plant[];

    @OneToMany(() => EventParty, eventParty => eventParty.object)
    eventParties: EventParty[];

    @OneToMany(() => Composant, composant => composant.object)
    composants: Composant[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 