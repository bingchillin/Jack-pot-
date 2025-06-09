import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { CreatePersonResponseDto } from './dto/create-person-response.dto';
import * as bcrypt from 'bcrypt';
import { RoleService } from '../role/role.service';
import { ObjectEntity } from 'src/object/entities/object.entity';
import { ObjectProfileService } from 'src/object-profile/object-profile.service';

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private personRepository: Repository<Person>,
        private roleService: RoleService,
        private objectProfileService: ObjectProfileService
    ) {}

    async create(createPersonDto: CreatePersonDto): Promise<CreatePersonResponseDto> {
        const existingPerson = await this.personRepository.findOne({
            where: { email: createPersonDto.email }
        });

        if (existingPerson) {
            throw new ConflictException('Email already exists');
        }

        // Hash the password before creating the person
        const hashedPassword = await bcrypt.hash(createPersonDto.password, 10);
        
        const person = this.personRepository.create({
            ...createPersonDto,
            password: hashedPassword
        });

        if (createPersonDto.idRole) {
            const role = await this.roleService.findOne(createPersonDto.idRole);
            person.role = role;
        }

        const savedPerson = await this.personRepository.save(person);
        
        // Map to response DTO
        const response: CreatePersonResponseDto = {
            idPerson: savedPerson.idPerson,
            email: savedPerson.email,
            firstname: savedPerson.firstname,
            surname: savedPerson.surname,
            numberPhone: savedPerson.numberPhone,
            idRole: savedPerson.idRole,
            isEmailVerified: savedPerson.isEmailVerified
        };

        return response;
    }

    async findAll(): Promise<Person[]> {
        return await this.personRepository.find({
            relations: ['role']
        });
    }

    async findOne(id: number): Promise<Person> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id },
            relations: ['role', 'objects']
        });

        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }

        return person;
    }

    async findByEmail(email: string): Promise<Person | null> {
        const person = await this.personRepository.findOne({
            where: { email: email },
            relations: ['role']
        });

        return person;
    }

    async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
        const person = await this.findOne(id);

        if (updatePersonDto.password) {
            updatePersonDto.password = await bcrypt.hash(updatePersonDto.password, 10);
        }

        if (updatePersonDto.idRole) {
            const role = await this.roleService.findOne(updatePersonDto.idRole);
            person.role = role;
        }

        Object.assign(person, updatePersonDto);
        return await this.personRepository.save(person);
    }

    async findObjectsByPersonId(id: number): Promise<ObjectEntity[]> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id },
            relations: ['objectProfiles', 'objectProfiles.object']
        });

        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }

        // Get all objects from the person's object profiles
        const objects = person.objectProfiles.map(profile => profile.object);

        // For each object, get its profiles
        const objectsWithProfiles = await Promise.all(
            objects.map(async (object) => {
                const profiles = await this.objectProfileService.findByObject(object.idObject);
                // Transform profiles to remove the object field
                const transformedProfiles = profiles.map(({ object: _, ...profile }) => profile);
                return {
                    ...object,
                    profiles: transformedProfiles
                };
            })
        );

        return objectsWithProfiles;
    }

    async remove(id: number): Promise<void> {
        const person = await this.findOne(id);
        await this.personRepository.remove(person);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }
} 