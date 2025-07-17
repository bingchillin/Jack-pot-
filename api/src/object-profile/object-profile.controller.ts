import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { ObjectProfileService } from './object-profile.service';
import { CreateObjectProfileDto } from './dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from './dto/update-object-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('object-profile')
@UseGuards(JwtAuthGuard)
export class ObjectProfileController {
    constructor(private readonly objectProfileService: ObjectProfileService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateObjectProfileDto })
    create(@Body() createObjectProfileDto: CreateObjectProfileDto) {
        return this.objectProfileService.create(createObjectProfileDto);
    }

    @Get()
    @ApiExcludeEndpoint()
    findAll(
        @Query('title') title?: string,
        @Query('objectId') objectId?: string,
        @Query('plantTypeId') plantTypeId?: string
    ) {
        if (title) {
            return this.objectProfileService.findByTitle(title);
        }
        if (objectId) {
            return this.objectProfileService.findByObject(+objectId);
        }
        if (plantTypeId) {
            return this.objectProfileService.findByPlantType(+plantTypeId);
        }
        return this.objectProfileService.findAll();
    }

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.objectProfileService.findOne(+id);
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateObjectProfileDto })
    update(@Param('id') id: string, @Body() updateObjectProfileDto: UpdateObjectProfileDto) {
        return this.objectProfileService.update(+id, updateObjectProfileDto);
    }

    @Delete(':id')
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.objectProfileService.remove(+id);
    }

    @Post(':id/recalculate-health')
    @ApiExcludeEndpoint()
    recalculateHealth(@Param('id') id: string) {
        return this.objectProfileService.recalculateHealth(+id);
    }

    @Post(':id/test-health-calculation')
    @ApiExcludeEndpoint()
    testHealthCalculation(@Param('id') id: string, @Body() sensorData: any) {
        return this.objectProfileService.testHealthCalculation(+id, sensorData);
    }

    @Get(':id/debug-health')
    @ApiExcludeEndpoint()
    debugHealth(@Param('id') id: string) {
        return this.objectProfileService.debugHealth(+id);
    }
} 