import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { PlantPersonService } from './plant-person.service';
import { CreatePlantPersonDto } from './dto/create-plant-person.dto';
import { UpdatePlantPersonDto } from './dto/update-plant-person.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plant-person')
@UseGuards(JwtAuthGuard)
export class PlantPersonController {
    constructor(private readonly plantPersonService: PlantPersonService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreatePlantPersonDto })
    create(@Body() createPlantPersonDto: CreatePlantPersonDto) {
        return this.plantPersonService.create(createPlantPersonDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findAll(
        @Query('plantId') plantId?: number,
        @Query('personId') personId?: number
    ) {
        if (plantId) {
            return this.plantPersonService.findByPlantId(plantId);
        }
        if (personId) {
            return this.plantPersonService.findByPersonId(personId);
        }
        return this.plantPersonService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.plantPersonService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdatePlantPersonDto })
    update(@Param('id') id: string, @Body() updatePlantPersonDto: UpdatePlantPersonDto) {
        return this.plantPersonService.update(+id, updatePlantPersonDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.plantPersonService.remove(+id);
    }
} 