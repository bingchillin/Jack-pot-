import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Plant } from '../../plant/entities/plant.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('plant_person')
export class PlantPerson {
    @PrimaryGeneratedColumn({ name: 'id_plant_person' })
    idPlantPerson: number;

    @ManyToOne(() => Plant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_plant' })
    plant: Plant;

    @ManyToOne(() => Person, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_person' })
    person: Person;

    @Column({ default: false })
    isOwner: boolean;

    @Column({ default: false })
    isSeller: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 