import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBody, ApiExcludeEndpoint } from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('person')
export class PersonController {
    constructor(private readonly personService: PersonService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreatePersonDto })
    create(@Body() createPersonDto: CreatePersonDto) {
        return this.personService.create(createPersonDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findAll() {
        return this.personService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.personService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdatePersonDto })
    update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
        return this.personService.update(+id, updatePersonDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.personService.remove(+id);
    }
} 