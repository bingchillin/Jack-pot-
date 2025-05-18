import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { ObjectService } from './object.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('object')
@UseGuards(JwtAuthGuard)
export class ObjectController {
    constructor(private readonly objectService: ObjectService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateObjectDto })
    create(@Body() createObjectDto: CreateObjectDto) {
        return this.objectService.create(createObjectDto);
    }

    @Get()
    @ApiExcludeEndpoint()
    findAll(@Query('title') title?: string) {
        if (title) {
            return this.objectService.findByTitle(title);
        }
        return this.objectService.findAll();
    }

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.objectService.findOne(+id);
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateObjectDto })
    update(@Param('id') id: string, @Body() updateObjectDto: UpdateObjectDto) {
        return this.objectService.update(+id, updateObjectDto);
    }

    @Delete(':id')
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.objectService.remove(+id);
    }
} 