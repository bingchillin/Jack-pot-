import { Contact } from 'src/contact/entities/contact.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('relationship')
export class Relationship {
  @PrimaryGeneratedColumn({ name: 'id_relationship' })
  idRelationship: number;

  @Column({ length: 250, nullable: true })
  @Index({ unique: true })
  title: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Contact, contact => contact.relationship)
  contacts: Contact[];
}