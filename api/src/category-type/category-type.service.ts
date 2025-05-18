import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryTypeDto } from './dto/create-category-type.dto';
import { UpdateCategoryTypeDto } from './dto/update-category-type.dto';
import { CategoryType } from './entities/category-type.entity';

@Injectable()
export class CategoryTypeService {
    constructor(
        @InjectRepository(CategoryType)
        private categoryTypeRepository: Repository<CategoryType>,
    ) {}

    create(createCategoryTypeDto: CreateCategoryTypeDto) {
        const categoryType = this.categoryTypeRepository.create(createCategoryTypeDto);
        return this.categoryTypeRepository.save(categoryType);
    }

    findAll() {
        return this.categoryTypeRepository.find();
    }

    findOne(id: number) {
        return this.categoryTypeRepository.findOneBy({ idCategoryType: id });
    }

    findByTitle(title: string) {
        return this.categoryTypeRepository.findOneBy({ title });
    }

    async update(id: number, updateCategoryTypeDto: UpdateCategoryTypeDto) {
        await this.categoryTypeRepository.update(id, updateCategoryTypeDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const result = await this.categoryTypeRepository.delete(id);
        return { message: 'Category type deleted successfully' };
    }
} 