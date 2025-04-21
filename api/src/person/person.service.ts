import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private personRepository: Repository<Person>
    ) {}

    async create(createPersonDto: CreatePersonDto): Promise<Person> {
        const existingPerson = await this.personRepository.findOne({
            where: { mail: createPersonDto.mail }
        });

        if (existingPerson) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createPersonDto.password, 10);
        
        const person = this.personRepository.create({
            ...createPersonDto,
            password: hashedPassword
        });

        return this.personRepository.save(person);
    }

    async findAll(): Promise<Person[]> {
        return this.personRepository.find();
    }

    async findOne(id: number): Promise<Person> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id }
        });

        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }

        return person;
    }

    async findByEmail(email: string): Promise<Person> {
        const person = await this.personRepository.findOne({
            where: { mail: email }
        });

        if (!person) {
            throw new NotFoundException(`Person with email ${email} not found`);
        }

        return person;
    }

    async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
        const person = await this.findOne(id);

        if (updatePersonDto.password) {
            updatePersonDto.password = await bcrypt.hash(updatePersonDto.password, 10);
        }

        if (updatePersonDto.mail && updatePersonDto.mail !== person.mail) {
            const existingPerson = await this.personRepository.findOne({
                where: { mail: updatePersonDto.mail }
            });

            if (existingPerson) {
                throw new ConflictException('Email already exists');
            }
        }

        await this.personRepository.update(id, updatePersonDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const result = await this.personRepository.delete(id);
        
        if (result.affected === 0) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }
    }
} 