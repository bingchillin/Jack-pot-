import {Controller, Delete, Get, Param, Patch, Post, UseGuards, Body} from '@nestjs/common';
import {LocalAuthGuard} from "../auth/local-auth.guard";
import {AuthService} from "../auth/auth.service";
import { PersonService } from '../person/person.service';
import { UpdatePersonDto } from 'src/person/dto/update-person.dto';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { ApiDocs } from './swagger.docs';

@Controller('api')
export class ApiController {
    constructor(
        private readonly personService: PersonService,
        private readonly authService: AuthService,
    ) {}

    // ================================ Person ================================
    @ApiTags('Person')
    @Post('/person')
    @ApiDocs.createPerson.operation
    @ApiDocs.createPerson.body
    @ApiDocs.createPerson.responses.success
    @ApiDocs.createPerson.responses.error
    createPerson(@Body() createPersonDto: CreatePersonDto) {
        return this.personService.create(createPersonDto);
    }

    @ApiTags('Person')
    @Get('/persons')
    @ApiDocs.findAllPersons.operation
    @ApiDocs.findAllPersons.response
    findAllPersons() {
        return this.personService.findAll();
    }

    @ApiTags('Person')
    @Get('/person/:id')
    @ApiDocs.findOnePerson.operation
    @ApiDocs.findOnePerson.param
    @ApiDocs.findOnePerson.responses.success
    @ApiDocs.findOnePerson.responses.error
    findOnePerson(@Param('id') id: string) {
        return this.personService.findOne(+id);
    }

    @ApiTags('Person')
    @Patch('/person/:id')
    @ApiDocs.updatePerson.operation
    @ApiDocs.updatePerson.param
    @ApiDocs.updatePerson.body
    @ApiDocs.updatePerson.responses.success
    @ApiDocs.updatePerson.responses.error
    updatePerson(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
        return this.personService.update(+id, updatePersonDto);
    }

    @ApiTags('Person')
    @Delete('/person/:id')
    @ApiDocs.removePerson.operation
    @ApiDocs.removePerson.param
    @ApiDocs.removePerson.responses.success
    @ApiDocs.removePerson.responses.error
    removePerson(@Param('id') id: string) {
        return this.personService.remove(+id);
    }
    // ================================ Person ================================

    // ================================ Auth ================================
    @ApiTags('Auth')
    @UseGuards(LocalAuthGuard)
    @ApiExcludeEndpoint()
    @Post('login')
    login(@Body() loginDto: { mail: string; password: string }) {
        return this.authService.login(loginDto);
    }
    // ================================ Auth ================================
}
