import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { RelationshipService } from './relationship.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('relationship')
@UseGuards(JwtAuthGuard)
export class RelationshipController {
    constructor(private readonly relationshipService: RelationshipService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateRelationshipDto })
    create(@Body() createRelationshipDto: CreateRelationshipDto) {
        return this.relationshipService.create(createRelationshipDto);
    }

    @Get()
    @ApiExcludeEndpoint()
    findAll(@Query('title') title?: string) {
        if (title) {
            return this.relationshipService.findByTitle(title);
        }
        return this.relationshipService.findAll();
    }

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.relationshipService.findOne(+id);
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateRelationshipDto })
    update(@Param('id') id: string, @Body() updateRelationshipDto: UpdateRelationshipDto) {
        return this.relationshipService.update(+id, updateRelationshipDto);
    }

    @Delete(':id')
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.relationshipService.remove(+id);
    }
} 