import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectEntity } from './entities/object.entity';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';

@Injectable()
export class ObjectService {
    constructor(
        @InjectRepository(ObjectEntity)
        private readonly objectRepository: Repository<ObjectEntity>
    ) {}

    create(createObjectDto: CreateObjectDto) {
        const object = this.objectRepository.create(createObjectDto);
        return this.objectRepository.save(object);
    }

    findAll() {
        return this.objectRepository.find({
            relations: ['categoryType'],
            select: {
                idObject: true,
                title: true,
                description: true,
                advise: true,
                idCategoryType: true,
                preferenceNumber: true,
                isReset: true,
                createdAt: true,
                updatedAt: true,

                categoryType: {
                    idCategoryType: true,
                    title: true,
                    description: true,
                    advise: true
                }
            }
        });
    }

    async findOne(id: number) {
        const object = await this.objectRepository.findOne({
            where: { idObject: id },
            relations: ['categoryType'],
            select: {
                idObject: true,
                title: true,
                description: true,
                advise: true,
                idCategoryType: true,
                preferenceNumber: true,
                isReset: true,
                createdAt: true,
                updatedAt: true,
                
                categoryType: {
                    idCategoryType: true,
                    title: true,
                    description: true,
                    advise: true
                }
            }
        });

        if (!object) {
            throw new NotFoundException(`Object with ID ${id} not found`);
        }

        return object;
    }

    async findByTitle(title: string) {
        const object = await this.objectRepository.findOne({
            where: { title },
            relations: ['categoryType'],
            select: {
                idObject: true,
                title: true,
                description: true,
                advise: true,
                idCategoryType: true,
                preferenceNumber: true,
                isReset: true,
                createdAt: true,
                updatedAt: true,

                categoryType: {
                    idCategoryType: true,
                    title: true,
                    description: true,
                    advise: true
                }
            }
        });

        if (!object) {
            throw new NotFoundException(`Object with title ${title} not found`);
        }

        return object;
    }

    async update(id: number, updateObjectDto: UpdateObjectDto) {
        const object = await this.findOne(id);
        Object.assign(object, updateObjectDto);
        return this.objectRepository.save(object);
    }

    async remove(id: number) {
        return this.objectRepository.delete(id);
    }
} 