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

    async create(createPlantTypeDto: CreatePlantTypeDto) {
        const plantType = await this.plantTypeRepository.create(createPlantTypeDto);
        return await this.plantTypeRepository.save(plantType);
    }

    async findAll() {
        return await this.plantTypeRepository.find(
        );
    }

    async findOne(id: number): Promise<PlantType> {
        const plantType = await this.plantTypeRepository.findOne({
            where: { idPlantType: id },
            relations: ['objectProfiles', 'avatars']
        });

        if (!plantType) {
            throw new NotFoundException(`Plant type with ID ${id} not found`);
        }

        return plantType;
    }

    async findByTitle(title: string): Promise<PlantType> {
        const plantType = await this.plantTypeRepository.findOne({
            where: { title },
            relations: ['objectProfiles', 'avatars']
        });

        if (!plantType) {
            throw new NotFoundException(`Plant type with title ${title} not found`);
        }

        return plantType;
    }

    async update(id: number, updatePlantTypeDto: UpdatePlantTypeDto): Promise<PlantType> {
        const plantType = await this.findOne(id);
        Object.assign(plantType, updatePlantTypeDto);
        return await this.plantTypeRepository.save(plantType);
    }

    async remove(id: number): Promise<void> {
        const plantType = await this.findOne(id);
        await this.plantTypeRepository.remove(plantType);
    }
} 