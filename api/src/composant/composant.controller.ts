import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { ComposantService } from './composant.service';
import { CreateComposantDto } from './dto/create-composant.dto';
import { UpdateComposantDto } from './dto/update-composant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('composant')
@UseGuards(JwtAuthGuard)
export class ComposantController {
    constructor(private readonly composantService: ComposantService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateComposantDto })
    create(@Body() createComposantDto: CreateComposantDto) {
        return this.composantService.create(createComposantDto);
    }

    @Get()
    @ApiExcludeEndpoint()
    findAll(@Query('title') title?: string, @Query('objectId') objectId?: string) {
        if (title) {
            return this.composantService.findByTitle(title);
        }
        if (objectId) {
            return this.composantService.findByObject(+objectId);
        }
        return this.composantService.findAll();
    }

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.composantService.findOne(+id);
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateComposantDto })
    update(@Param('id') id: string, @Body() updateComposantDto: UpdateComposantDto) {
        return this.composantService.update(+id, updateComposantDto);
    }

    @Delete(':id')
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.composantService.remove(+id);
    }
} 