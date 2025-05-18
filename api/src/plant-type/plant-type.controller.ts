import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { PlantTypeService } from './plant-type.service';
import { CreatePlantTypeDto } from './dto/create-plant-type.dto';
import { UpdatePlantTypeDto } from './dto/update-plant-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('plant-type')
@UseGuards(JwtAuthGuard)
export class PlantTypeController {
    constructor(private readonly plantTypeService: PlantTypeService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreatePlantTypeDto })
    create(@Body() createPlantTypeDto: CreatePlantTypeDto) {
        return this.plantTypeService.create(createPlantTypeDto);
    }

    @Get()
    @ApiExcludeEndpoint()
    findAll(@Query('title') title?: string) {
        if (title) {
            return this.plantTypeService.findByTitle(title);
        }
        return this.plantTypeService.findAll();
    }

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.plantTypeService.findOne(+id);
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdatePlantTypeDto })
    update(@Param('id') id: string, @Body() updatePlantTypeDto: UpdatePlantTypeDto) {
        return this.plantTypeService.update(+id, updatePlantTypeDto);
    }

    @Delete(':id')
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.plantTypeService.remove(+id);
    }
} 