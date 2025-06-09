import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Relationship } from '../../relationship/entities/relationship.entity';

@Entity('contact')
export class Contact {
  @PrimaryGeneratedColumn({ name: 'id_contact' })
  idContact: number;

  @Column({ length: 250, nullable: true })
  relation: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ name: 'value_return', length: 100, nullable: true })
  valueReturn: string;

  @Column({ name: 'id_person', nullable: true })
  idPerson: number;

  @ManyToOne(() => Person, person => person.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ name: 'id_relationship', nullable: true })
  idRelationship: number;

  @ManyToOne(() => Relationship, relationship => relationship.contacts, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_relationship' })
  relationship: Relationship;

  @Column({ name: 'isActive', default: false })
  @Index()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}