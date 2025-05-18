import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Relationship } from './entities/relationship.entity';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';

@Injectable()
export class RelationshipService {
    constructor(
        @InjectRepository(Relationship)
        private relationshipRepository: Repository<Relationship>,
    ) {}

    async create(createRelationshipDto: CreateRelationshipDto): Promise<Relationship> {
        const relationship = this.relationshipRepository.create(createRelationshipDto);
        return await this.relationshipRepository.save(relationship);
    }

    async findAll(): Promise<Relationship[]> {
        return await this.relationshipRepository.find({
            relations: ['contacts']
        });
    }

    async findOne(id: number): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: { idRelationship: id },
            relations: ['contacts']
        });
        if (!relationship) {
            throw new NotFoundException(`Relationship with ID ${id} not found`);
        }
        return relationship;
    }

    async findByTitle(title: string): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: { title },
            relations: ['contacts']
        });
        if (!relationship) {
            throw new NotFoundException(`Relationship with title ${title} not found`);
        }
        return relationship;
    }

    async update(id: number, updateRelationshipDto: UpdateRelationshipDto): Promise<Relationship> {
        const relationship = await this.findOne(id);
        Object.assign(relationship, updateRelationshipDto);
        return await this.relationshipRepository.save(relationship);
    }

    async remove(id: number): Promise<void> {
        const relationship = await this.findOne(id);
        await this.relationshipRepository.remove(relationship);
    }
} 