import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Person } from '../../person/entities/person.entity';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @ManyToOne(() => Person, person => person.refreshTokens, { onDelete: 'CASCADE' })
  user: Person;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
} 