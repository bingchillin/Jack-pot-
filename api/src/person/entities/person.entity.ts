import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('person')
export class Person {
    @PrimaryGeneratedColumn({ name: 'id_person' })
    idPerson: number;

    @Index({ unique: true })
    @Column({ length: 250, nullable: true })
    email: string;

    @Column({ length: 250, nullable: true })
    firstname: string;

    @Column({ length: 250, nullable: true })
    surname: string;

    @Column({ length: 500, nullable: false })
    @Exclude()
    password: string;

    @Index()
    @Column({ length: 50, nullable: true, name: 'number_phone' })
    numberPhone: string;

    @Column({ name: 'id_role', nullable: true })
    idRole: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: false, nullable: false })
    isEmailVerified: boolean;

    @Column({ nullable: true })
    emailVerificationToken: string;

    @Column({ nullable: true })
    verificationCode: string;

    @Column({ nullable: true })
    verificationCodeExpires: Date;

    @Column({ type: 'integer', default: 0, nullable: true })
    resetTokenVersion: number;
} 