import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { CategoryTypeService } from './category-type.service';
import { CreateCategoryTypeDto } from './dto/create-category-type.dto';
import { UpdateCategoryTypeDto } from './dto/update-category-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('category-type')
@UseGuards(JwtAuthGuard)
export class CategoryTypeController {
    constructor(private readonly categoryTypeService: CategoryTypeService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateCategoryTypeDto })
    create(@Body() createCategoryTypeDto: CreateCategoryTypeDto) {
        return this.categoryTypeService.create(createCategoryTypeDto);
    }

    @Get()
    @ApiExcludeEndpoint()
    findAll(@Query('title') title?: string) {
        if (title) {
            return this.categoryTypeService.findByTitle(title);
        }
        return this.categoryTypeService.findAll();
    }

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.categoryTypeService.findOne(+id);
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateCategoryTypeDto })
    update(@Param('id') id: string, @Body() updateCategoryTypeDto: UpdateCategoryTypeDto) {
        return this.categoryTypeService.update(+id, updateCategoryTypeDto);
    }

    @Delete(':id')
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.categoryTypeService.remove(+id);
    }
} 