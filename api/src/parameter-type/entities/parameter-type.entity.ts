import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PersonParameter } from '../../lnk-person-parameter/entities/person-parameter.entity';

@Entity('parameter_type')
export class ParameterType {
  @PrimaryGeneratedColumn({ name: 'id_parameter_type' })
  idParameterType: number;

  @Column({ length: 250, nullable: true })
  title: string;

  @Column({ length: 5000, nullable: true })
  advise: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PersonParameter, personParameter => personParameter.parameterType)
  personParameters: PersonParameter[];
}