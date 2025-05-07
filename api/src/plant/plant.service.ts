import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plant } from './entities/plant.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantService {
    constructor(
        @InjectRepository(Plant)
        private plantRepository: Repository<Plant>,
    ) {}

    async create(createPlantDto: CreatePlantDto): Promise<Plant> {
        const plant = this.plantRepository.create(createPlantDto);
        return await this.plantRepository.save(plant);
    }

    async findAll(): Promise<Plant[]> {
        return await this.plantRepository.find();
    }

    async findOne(id: number): Promise<Plant> {
        const plant = await this.plantRepository.findOne({ where: { idPlant: id } });
        if (!plant) {
            throw new NotFoundException(`Plant with ID ${id} not found`);
        }
        return plant;
    }

    async update(id: number, updatePlantDto: UpdatePlantDto): Promise<Plant> {
        const plant = await this.findOne(id);
        Object.assign(plant, updatePlantDto);
        return await this.plantRepository.save(plant);
    }

    async remove(id: number): Promise<void> {
        const plant = await this.findOne(id);
        await this.plantRepository.remove(plant);
    }
} 