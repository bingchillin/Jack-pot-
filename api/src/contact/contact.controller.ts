import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateContactDto })
    create(@Body() createContactDto: CreateContactDto) {
        return this.contactService.create(createContactDto);
    }

    @Get()
    @ApiExcludeEndpoint()
    findAll(
        @Query('personId') personId?: string,
        @Query('relationshipId') relationshipId?: string
    ) {
        if (personId) {
            return this.contactService.findByPerson(+personId);
        }
        if (relationshipId) {
            return this.contactService.findByRelationship(+relationshipId);
        }
        return this.contactService.findAll();
    }

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.contactService.findOne(+id);
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateContactDto })
    update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
        return this.contactService.update(+id, updateContactDto);
    }

    @Delete(':id')
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.contactService.remove(+id);
    }
} 