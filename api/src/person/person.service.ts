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
import { ObjectProfile } from 'src/object-profile/entities/object-profile.entity';

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
            relations: ['role']
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
            relations: [
                'objectProfiles', 
                'objectProfiles.object', 
                'objectProfiles.plantType'
            ]
        });
    
        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }
    
        const objectMap = new Map<number, any>();
        
        person.objectProfiles.forEach(profile => {
            const objectId = profile.object.idObject;
            
            if (!objectMap.has(objectId)) {
                // Initialize object without objectProfiles to avoid duplication
                const { objectProfiles, ...objectData } = profile.object;
                objectMap.set(objectId, {
                    ...objectData,
                    profiles: []
                });
            }
            
            // Add cleaned profile to the object
            const cleanProfile = {
                idObjectProfile: profile.idObjectProfile,
                title: profile.title,
                description: profile.description,
                advise: profile.advise,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
                plantType: profile.plantType ? {
                    idPlantType: profile.plantType.idPlantType,
                    title: profile.plantType.title
                } : null
            };
            
            objectMap.get(objectId).profiles.push(cleanProfile);
        });
    
        return Array.from(objectMap.values());
    }

    async remove(id: number): Promise<void> {
        const person = await this.findOne(id);
        await this.personRepository.remove(person);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async findObjectsProfileByPersonId(id: number): Promise<ObjectProfile[]> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id },
            relations: ['objectProfiles', 'objectProfiles.object', 'objectProfiles.plantType']
        });

        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }

        // Return the object profiles with their associated objects and plant types
        return person.objectProfiles;
    }
} 