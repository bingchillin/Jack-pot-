import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryTypeService } from './category-type.service';
import { CategoryTypeController } from './category-type.controller';
import { CategoryType } from './entities/category-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoryType])],
    controllers: [CategoryTypeController],
    providers: [CategoryTypeService],
    exports: [CategoryTypeService]
})
export class CategoryTypeModule {} 