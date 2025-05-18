import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectProfile } from '../../object-profile/entities/object-profile.entity';
import { Avatar } from '../../avatar/entities/avatar.entity';

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

    @OneToMany(() => ObjectProfile, objectProfile => objectProfile.plantType)
    objectProfiles: ObjectProfile[];

    @OneToMany(() => Avatar, avatar => avatar.plantType)
    avatars: Avatar[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 