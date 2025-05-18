import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectProfile } from './entities/object-profile.entity';
import { CreateObjectProfileDto } from './dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from './dto/update-object-profile.dto';

@Injectable()
export class ObjectProfileService {
    constructor(
        @InjectRepository(ObjectProfile)
        private readonly objectProfileRepository: Repository<ObjectProfile>
    ) {}

    create(createObjectProfileDto: CreateObjectProfileDto) {
        const objectProfile = this.objectProfileRepository.create(createObjectProfileDto);
        return this.objectProfileRepository.save(objectProfile);
    }

    findAll() {
        return this.objectProfileRepository.find({
            relations: ['object', 'plantType']
        });
    }

    async findOne(id: number) {
        const objectProfile = await this.objectProfileRepository.findOne({
            where: { idObjectProfile: id },
            relations: ['object', 'plantType']
        });

        if (!objectProfile) {
            throw new NotFoundException(`Object profile with ID ${id} not found`);
        }

        return objectProfile;
    }

    async findByTitle(title: string) {
        const objectProfile = await this.objectProfileRepository.findOne({
            where: { title },
            relations: ['object', 'plantType']
        });

        if (!objectProfile) {
            throw new NotFoundException(`Object profile with title ${title} not found`);
        }

        return objectProfile;
    }

    async findByObject(idObject: number) {
        const objectProfiles = await this.objectProfileRepository.find({
            where: { idObject },
            relations: ['object', 'plantType']
        });

        if (!objectProfiles.length) {
            throw new NotFoundException(`No object profiles found for object with ID ${idObject}`);
        }

        return objectProfiles;
    }

    async findByPlantType(idPlantType: number) {
        const objectProfiles = await this.objectProfileRepository.find({
            where: { idPlantType },
            relations: ['object', 'plantType']
        });

        if (!objectProfiles.length) {
            throw new NotFoundException(`No object profiles found for plant type with ID ${idPlantType}`);
        }

        return objectProfiles;
    }

    async update(id: number, updateObjectProfileDto: UpdateObjectProfileDto) {
        const objectProfile = await this.findOne(id);
        Object.assign(objectProfile, updateObjectProfileDto);
        return this.objectProfileRepository.save(objectProfile);
    }

    async remove(id: number) {
        const objectProfile = await this.findOne(id);
        return this.objectProfileRepository.remove(objectProfile);
    }
} 