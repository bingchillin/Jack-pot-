import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PersonService } from '../person/person.service';
import { PersonDocs } from './swagger/person.docs';
import { CreatePersonDto } from '../person/dto/create-person.dto';
import { UpdatePersonDto } from '../person/dto/update-person.dto';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { AuthDocs } from './swagger/auth.docs';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PlantService } from 'src/plant/plant.service';
import { PlantDocs } from './swagger/plant.docs';
import { CreatePlantDto } from 'src/plant/dto/create-plant.dto';
import { UpdatePlantDto } from 'src/plant/dto/update-plant.dto';
import { EventPartyService } from 'src/event-party/event-party.service';
import { EventPartyDocs } from './swagger/event-party.docs';
import { CreateEventPartyDto } from 'src/event-party/dto/create-event-party.dto';
import { UpdateEventPartyDto } from 'src/event-party/dto/update-event-party.dto';
import { GameDocs } from './swagger/game.docs';
import { CreateGameDto } from 'src/game/dto/create-game.dto';
import { GameService } from 'src/game/game.service';
import { UpdateGameDto } from 'src/game/dto/update-game.dto';
import { PlantPersonService } from 'src/plant-person/plant-person.service';
import { CreatePlantPersonDto } from 'src/plant-person/dto/create-plant-person.dto';
import { PlantPersonDocs } from './swagger/plant-person.docs';
import { UpdatePlantPersonDto } from 'src/plant-person/dto/update-plant-person.dto';
import { GamePersonService } from 'src/game-person/game-person.service';
import { CreateGamePersonDto } from 'src/game-person/dto/create-game-person.dto';
import { GamePersonDocs } from './swagger/game-person.docs';
import { UpdateGamePersonDto } from 'src/game-person/dto/update-game-person.dto';
import { EventPartyPersonDocs } from './swagger/event-party-person.docs';
import { CreateEventPartyPersonDto } from 'src/event-party-person/dto/create-event-party-person.dto';
import { EventPartyPersonService } from 'src/event-party-person/event-party-person.service';
import { UpdateEventPartyPersonDto } from 'src/event-party-person/dto/update-event-party-person.dto';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
import { RoleDocs } from './swagger/role.docs';
import { UpdateRoleDto } from 'src/role/dto/update-role.dto';
import { RoleService } from 'src/role/role.service';
import { ApiService } from './api.service';

@ApiTags('z-API')
@Controller('api')
export class ApiController {
  constructor(
    private readonly personService: PersonService,
    private readonly authService: AuthService,
    private readonly plantService: PlantService,
    private readonly eventPartyService: EventPartyService,
    private readonly gameService: GameService,
    private readonly plantPersonService: PlantPersonService,
    private readonly gamePersonService: GamePersonService,
    private readonly eventPartyPersonService: EventPartyPersonService,
    private readonly roleService: RoleService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiExcludeEndpoint()
  @Post('login')
  @AuthDocs.login()
  login(@Body() loginDto: { mail: string; password: string }) {
    return this.authService.login(loginDto);
  }

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

  @Post('/plant')
  @PlantDocs.create()
  createPlant(@Body() dto: CreatePlantDto) {
    return this.plantService.create(dto);
  }

  @Get('/plants')
  @PlantDocs.findAll()
  findAllPlants() {
    return this.plantService.findAll();
  }

  @Get('/plant/:id')
  @PlantDocs.findOne()
  findOnePlant(@Param('id') id: string) {
    return this.plantService.findOne(+id);
  }

  @Patch('/plant/:id')
  @PlantDocs.update()
  updatePlant(@Param('id') id: string, @Body() dto: UpdatePlantDto) {
    return this.plantService.update(+id, dto);
  }

  @Delete('/plant/:id')
  @PlantDocs.remove()
  removePlant(@Param('id') id: string) {
    return this.plantService.remove(+id);
  }  

  @Post('/event-party')
  @EventPartyDocs.create()
  createEventParty(@Body() dto: CreateEventPartyDto) {
    return this.eventPartyService.create(dto);
  }

  @Get('/event-parties')
  @EventPartyDocs.findAll()
  findAllEventParties() {
    return this.eventPartyService.findAll();
  }

  @Get('/event-party/:id')
  @EventPartyDocs.findOne()
  findOneEventParty(@Param('id') id: string) {
    return this.eventPartyService.findOne(+id);
  }

  @Patch('/event-party/:id')
  @EventPartyDocs.update()
  updateEventParty(@Param('id') id: string, @Body() dto: UpdateEventPartyDto) {
    return this.eventPartyService.update(+id, dto);
  } 

  @Delete('/event-party/:id')
  @EventPartyDocs.remove()
  removeEventParty(@Param('id') id: string) {
    return this.eventPartyService.remove(+id);
  } 

  @Post('/game')
  @GameDocs.create()
  createGame(@Body() dto: CreateGameDto) {
    return this.gameService.create(dto);
  }

  @Get('/games')
  @GameDocs.findAll()
  findAllGames() {
    return this.gameService.findAll();
  }

  @Get('/game/:id')
  @GameDocs.findOne()
  findOneGame(@Param('id') id: string) {
    return this.gameService.findOne(+id);
  }

  @Patch('/game/:id')
  @GameDocs.update()
  updateGame(@Param('id') id: string, @Body() dto: UpdateGameDto) {
    return this.gameService.update(+id, dto);
  }

  @Delete('/game/:id')
  @GameDocs.remove()
  removeGame(@Param('id') id: string) {
    return this.gameService.remove(+id);
  }

  @Post('/plant-person')
  @PlantPersonDocs.create()
  createPlantPerson(@Body() dto: CreatePlantPersonDto) {
    return this.plantPersonService.create(dto);
  }

  @Get('/plant-persons')
  @PlantPersonDocs.findAll()
  findAllPlantPersons() {
    return this.plantPersonService.findAll();
  }

  @Get('/plant-person/:id')
  @PlantPersonDocs.findOne()
  findOnePlantPerson(@Param('id') id: string) {
    return this.plantPersonService.findOne(+id);
  }

  @Patch('/plant-person/:id')
  @PlantPersonDocs.update()
  updatePlantPerson(@Param('id') id: string, @Body() dto: UpdatePlantPersonDto) {
    return this.plantPersonService.update(+id, dto);
  }

  @Delete('/plant-person/:id')
  @PlantPersonDocs.remove()
  removePlantPerson(@Param('id') id: string) {
    return this.plantPersonService.remove(+id);
  }

  @Post('/game-person')
  @GamePersonDocs.create()
  createGamePerson(@Body() dto: CreateGamePersonDto) {
    return this.gamePersonService.create(dto);
  }

  @Get('/game-persons')
  @GamePersonDocs.findAll()
  findAllGamePersons() {
    return this.gamePersonService.findAll();
  }

  @Get('/game-person/:id')
  @GamePersonDocs.findOne()
  findOneGamePerson(@Param('id') id: string) {
    return this.gamePersonService.findOne(+id);
  }

  @Patch('/game-person/:id')
  @GamePersonDocs.update()
  updateGamePerson(@Param('id') id: string, @Body() dto: UpdateGamePersonDto) {
    return this.gamePersonService.update(+id, dto);
  }

  @Delete('/game-person/:id')
  @GamePersonDocs.remove()
  removeGamePerson(@Param('id') id: string) {
    return this.gamePersonService.remove(+id);
  }

  @Post('/event-party-person')
  @EventPartyPersonDocs.create()
  createEventPartyPerson(@Body() dto: CreateEventPartyPersonDto) {
    return this.eventPartyPersonService.create(dto);
  }

  @Get('/event-party-persons')
  @EventPartyPersonDocs.findAll()
  findAllEventPartyPersons() {
    return this.eventPartyPersonService.findAll();
  }

  @Get('/event-party-person/:id')
  @EventPartyPersonDocs.findOne()
  findOneEventPartyPerson(@Param('id') id: string) {
    return this.eventPartyPersonService.findOne(+id);
  }

  @Patch('/event-party-person/:id')
  @EventPartyPersonDocs.update()
  updateEventPartyPerson(@Param('id') id: string, @Body() dto: UpdateEventPartyPersonDto) {
    return this.eventPartyPersonService.update(+id, dto);
  }

  @Delete('/event-party-person/:id')
  @EventPartyPersonDocs.remove()
  removeEventPartyPerson(@Param('id') id: string) {
    return this.eventPartyPersonService.remove(+id);
  }

  @Post('/role')
  @RoleDocs.create()
  createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  } 

  @Get('/roles')
  @RoleDocs.findAll()
  findAllRoles() {
    return this.roleService.findAll();
  }

  @Get('/role/:id')
  @RoleDocs.findOne()
  findOneRole(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch('/role/:id')
  @RoleDocs.update()
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(+id, dto);
  }

  @Delete('/role/:id')
  @RoleDocs.remove()
  removeRole(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }


}
