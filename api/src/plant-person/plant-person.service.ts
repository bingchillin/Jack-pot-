import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantPerson } from './entities/plant-person.entity';
import { CreatePlantPersonDto } from './dto/create-plant-person.dto';
import { UpdatePlantPersonDto } from './dto/update-plant-person.dto';

@Injectable()
export class PlantPersonService {
    constructor(
        @InjectRepository(PlantPerson)
        private plantPersonRepository: Repository<PlantPerson>,
    ) {}

    async create(createPlantPersonDto: CreatePlantPersonDto): Promise<PlantPerson> {
        const plantPerson = this.plantPersonRepository.create(createPlantPersonDto);
        return await this.plantPersonRepository.save(plantPerson);
    }

    async findAll(): Promise<PlantPerson[]> {
        return await this.plantPersonRepository.find({
            relations: ['plant', 'person']
        });
    }

    async findOne(id: number): Promise<PlantPerson> {
        const plantPerson = await this.plantPersonRepository.findOne({ 
            where: { idPlantPerson: id },
            relations: ['plant', 'person']
        });
        if (!plantPerson) {
            throw new NotFoundException(`Plant-Person relationship with ID ${id} not found`);
        }
        return plantPerson;
    }

    async update(id: number, updatePlantPersonDto: UpdatePlantPersonDto): Promise<PlantPerson> {
        const plantPerson = await this.findOne(id);
        Object.assign(plantPerson, updatePlantPersonDto);
        return await this.plantPersonRepository.save(plantPerson);
    }

    async remove(id: number): Promise<void> {
        const plantPerson = await this.findOne(id);
        await this.plantPersonRepository.remove(plantPerson);
    }

    async findByPlantId(plantId: number): Promise<PlantPerson[]> {
        return await this.plantPersonRepository.find({
            where: { plant: { idPlant: plantId } },
            relations: ['plant', 'person']
        });
    }

    async findByPersonId(personId: number): Promise<PlantPerson[]> {
        return await this.plantPersonRepository.find({
            where: { person: { idPerson: personId } },
            relations: ['plant', 'person']
        });
    }
} 