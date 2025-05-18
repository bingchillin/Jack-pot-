import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantType } from './entities/plant-type.entity';
import { CreatePlantTypeDto } from './dto/create-plant-type.dto';
import { UpdatePlantTypeDto } from './dto/update-plant-type.dto';

@Injectable()
export class PlantTypeService {
    constructor(
        @InjectRepository(PlantType)
        private readonly plantTypeRepository: Repository<PlantType>
    ) {}

    create(createPlantTypeDto: CreatePlantTypeDto) {
        const plantType = this.plantTypeRepository.create(createPlantTypeDto);
        return this.plantTypeRepository.save(plantType);
    }

    findAll() {
        return this.plantTypeRepository.find({
            relations: ['objectProfiles', 'avatars']
        });
    }

    async findOne(id: number) {
        const plantType = await this.plantTypeRepository.findOne({
            where: { idPlantType: id },
            relations: ['objectProfiles', 'avatars']
        });

        if (!plantType) {
            throw new NotFoundException(`Plant type with ID ${id} not found`);
        }

        return plantType;
    }

    async findByTitle(title: string) {
        const plantType = await this.plantTypeRepository.findOne({
            where: { title },
            relations: ['objectProfiles', 'avatars']
        });

        if (!plantType) {
            throw new NotFoundException(`Plant type with title ${title} not found`);
        }

        return plantType;
    }

    async update(id: number, updatePlantTypeDto: UpdatePlantTypeDto) {
        const plantType = await this.findOne(id);
        Object.assign(plantType, updatePlantTypeDto);
        return this.plantTypeRepository.save(plantType);
    }

    async remove(id: number) {
        const plantType = await this.findOne(id);
        return this.plantTypeRepository.remove(plantType);
    }
} 