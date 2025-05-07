import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PersonService } from '../person/person.service';
import { PersonDocs } from './swagger/person.docs';
import { CreatePersonDto } from '../person/dto/create-person.dto';
import { UpdatePersonDto } from '../person/dto/update-person.dto';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { AuthDocs } from './swagger/auth.docs';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('z-Deprecated')
@Controller('api')
export class ApiController {
  constructor(
    private readonly personService: PersonService,
    private readonly authService: AuthService,
  ) {}

  @Post('/person')
  @PersonDocs.create()
  createPerson(@Body() dto: CreatePersonDto) {
    return this.personService.create(dto);
  }

  @Get('/persons')
  @PersonDocs.findAll()
  findAllPersons() {
    return this.personService.findAll();
  }

  @Get('/person/:id')
  @PersonDocs.findOne()
  findOnePerson(@Param('id') id: string) {
    return this.personService.findOne(+id);
  }

  @Patch('/person/:id')
  @PersonDocs.update()
  updatePerson(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
    return this.personService.update(+id, dto);
  }

  @Delete('/person/:id')
  @PersonDocs.remove()
  removePerson(@Param('id') id: string) {
    return this.personService.remove(+id);
  }

  @UseGuards(LocalAuthGuard)
  @ApiExcludeEndpoint()
  @Post('login')
  @AuthDocs.login()
  login(@Body() loginDto: { mail: string; password: string }) {
    return this.authService.login(loginDto);
  }
}
