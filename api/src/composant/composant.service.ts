import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Composant } from './entities/composant.entity';
import { CreateComposantDto } from './dto/create-composant.dto';
import { UpdateComposantDto } from './dto/update-composant.dto';

@Injectable()
export class ComposantService {
    constructor(
        @InjectRepository(Composant)
        private readonly composantRepository: Repository<Composant>
    ) {}

    create(createComposantDto: CreateComposantDto) {
        const composant = this.composantRepository.create(createComposantDto);
        return this.composantRepository.save(composant);
    }

    findAll() {
        return this.composantRepository.find({
            relations: ['object']
        });
    }

    async findOne(id: number) {
        const composant = await this.composantRepository.findOne({
            where: { idComposant: id },
            relations: ['object']
        });

        if (!composant) {
            throw new NotFoundException(`Composant with ID ${id} not found`);
        }

        return composant;
    }

    async findByTitle(title: string) {
        const composant = await this.composantRepository.findOne({
            where: { title },
            relations: ['object']
        });

        if (!composant) {
            throw new NotFoundException(`Composant with title ${title} not found`);
        }

        return composant;
    }

    async findByObject(idObject: number) {
        const composants = await this.composantRepository.find({
            where: { idObject },
            relations: ['object']
        });

        if (!composants.length) {
            throw new NotFoundException(`No composants found for object with ID ${idObject}`);
        }

        return composants;
    }

    async update(id: number, updateComposantDto: UpdateComposantDto) {
        const composant = await this.findOne(id);
        Object.assign(composant, updateComposantDto);
        return this.composantRepository.save(composant);
    }

    async remove(id: number) {
        const composant = await this.findOne(id);
        return this.composantRepository.remove(composant);
    }
} 