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
@ApiTags('z-API')
@Controller('api')
export class ApiController {
  constructor(
    private readonly personService: PersonService,
    private readonly authService: AuthService,
    private readonly plantService: PlantService,
    private readonly eventPartyService: EventPartyService,
    private readonly gameService: GameService,
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
}
