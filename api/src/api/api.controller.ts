import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Request } from '@nestjs/common';
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
import { CategoryTypeService } from 'src/category-type/category-type.service';
import { CreateCategoryTypeDto } from 'src/category-type/dto/create-category-type.dto';
import { UpdateCategoryTypeDto } from 'src/category-type/dto/update-category-type.dto';
import { CategoryTypeDocs } from './swagger/category-type.docs';
import { PlantTypeService } from 'src/plant-type/plant-type.service';
import { CreatePlantTypeDto } from 'src/plant-type/dto/create-plant-type.dto';
import { UpdatePlantTypeDto } from 'src/plant-type/dto/update-plant-type.dto';
import { PlantTypeDocs } from './swagger/plant-type.docs';
import { ObjectProfileService } from 'src/object-profile/object-profile.service';
import { CreateObjectProfileDto } from 'src/object-profile/dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from 'src/object-profile/dto/update-object-profile.dto';
import { ObjectProfileDocs } from './swagger/object-profile.docs';
import { ContactService } from 'src/contact/contact.service';
import { CreateContactDto } from 'src/contact/dto/create-contact.dto';
import { UpdateContactDto } from 'src/contact/dto/update-contact.dto';
import { ContactDocs } from './swagger/contact.docs';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AvatarService } from 'src/avatar/avatar.service';
import { CreateAvatarDto } from 'src/avatar/dto/create-avatar.dto';
import { UpdateAvatarDto } from 'src/avatar/dto/update-avatar.dto';
import { AvatarDocs } from './swagger/avatar.docs';
import { PersonParameterService } from 'src/lnk-person-parameter/person-parameter.service';
import { CreatePersonParameterDto } from 'src/lnk-person-parameter/dto/create-person-parameter.dto';
import { UpdatePersonParameterDto } from 'src/lnk-person-parameter/dto/update-person-parameter.dto';
import { PersonParameterDocs } from './swagger/person-parameter.docs';
import { ParameterTypeService } from 'src/parameter-type/parameter-type.service';
import { CreateParameterTypeDto } from 'src/parameter-type/dto/create-parameter-type.dto';
import { UpdateParameterTypeDto } from 'src/parameter-type/dto/update-parameter-type.dto';
import { ParameterTypeDocs } from './swagger/parameter-type.docs';
import { ObjectService } from '../object/object.service';
import { CreateObjectDto } from '../object/dto/create-object.dto';
import { UpdateObjectDto } from '../object/dto/update-object.dto';
import { ObjectDocs } from './swagger/object.docs';
import { RelationshipService } from '../relationship/relationship.service';
import { CreateRelationshipDto } from '../relationship/dto/create-relationship.dto';
import { UpdateRelationshipDto } from '../relationship/dto/update-relationship.dto';
import { RelationshipDocs } from './swagger/relationship.docs';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { UpdateNotificationDto } from '../notification/dto/update-notification.dto';
import { NotificationDocs } from './swagger/notification.docs';

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
    private readonly categoryTypeService: CategoryTypeService,
    private readonly plantTypeService: PlantTypeService,
    private readonly objectProfileService: ObjectProfileService,
    private readonly contactService: ContactService,
    private readonly avatarService: AvatarService,
    private readonly personParameterService: PersonParameterService,
    private readonly parameterTypeService: ParameterTypeService,
    private readonly objectService: ObjectService,
    private readonly relationshipService: RelationshipService,
    private readonly notificationService: NotificationService,
  ) {}

  // =========================================
  // Authentication Endpoints
  // =========================================
  @UseGuards(LocalAuthGuard)
  @ApiExcludeEndpoint()
  @Post('login')
  @AuthDocs.login()
  login(@Body() loginDto: { mail: string; password: string }) {
    return this.authService.login(loginDto);
  }

  // =========================================
  // Person Management Endpoints
  // =========================================
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

  @Get('/person/:id/objects')
  //@PersonDocs.findObjectsByPersonId()
  findObjectsByPersonId(@Param('id') id: string) {
    return this.personService.findObjectsByPersonId(+id);
  }

  @Get('/person/:id/object-profiles')
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  findObjectsProfileByPersonId(@Param('id') id: string) {
      return this.personService.findObjectsProfileByPersonId(+id);
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

  // =========================================
  // Plant Management Endpoints
  // =========================================
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

  // =========================================
  // Event Party Management Endpoints
  // =========================================
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

  // =========================================
  // Game Management Endpoints
  // =========================================
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

  // =========================================
  // Plant-Person Relationship Endpoints
  // =========================================
  @Post('/plant-person')
  @PlantPersonDocs.create()
  createPlantPerson(@Body() dto: CreatePlantPersonDto) {
    return this.plantPersonService.create(dto);
  }

  @Get('/plant-persons')
  @PlantPersonDocs.findAll()
  findAllPlantPersons(
    @Query('plantId') plantId?: number,
    @Query('personId') personId?: number
  ) {
    if (plantId) {
      return this.plantPersonService.findByPlantId(plantId);
    }
    if (personId) {
      return this.plantPersonService.findByPersonId(personId);
    }
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

  // =========================================
  // Game-Person Relationship Endpoints
  // =========================================
  @Post('/game-person')
  @GamePersonDocs.create()
  createGamePerson(@Body() dto: CreateGamePersonDto) {
    return this.gamePersonService.create(dto);
  }

  @Get('/game-persons')
  @GamePersonDocs.findAll()
  findAllGamePersons(
    @Query('gameId') gameId?: number,
    @Query('personId') personId?: number
  ) {
    if (gameId) {
      return this.gamePersonService.findByGameId(gameId);
    }
    if (personId) {
      return this.gamePersonService.findByPersonId(personId);
    }
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

  // =========================================
  // Event Party-Person Relationship Endpoints
  // =========================================
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

  // =========================================
  // Role Management Endpoints
  // =========================================
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

  // =========================================
  // Category Type Management Endpoints
  // =========================================
  @Post('/category-type')
  @CategoryTypeDocs.create()
  createCategoryType(@Body() dto: CreateCategoryTypeDto) {
    return this.categoryTypeService.create(dto);
  }

  @Get('/category-types')
  @CategoryTypeDocs.findAll()
  findAllCategoryTypes(@Query('title') title?: string) {
    if (title) {
      return this.categoryTypeService.findByTitle(title);
    }
    return this.categoryTypeService.findAll();
  }

  @Get('/category-type/:id')
  @CategoryTypeDocs.findOne()
  findOneCategoryType(@Param('id') id: string) {
    return this.categoryTypeService.findOne(+id);
  }

  @Patch('/category-type/:id')
  @CategoryTypeDocs.update()
  updateCategoryType(@Param('id') id: string, @Body() dto: UpdateCategoryTypeDto) {
    return this.categoryTypeService.update(+id, dto);
  }

  @Delete('/category-type/:id')
  @CategoryTypeDocs.remove()
  removeCategoryType(@Param('id') id: string) {
    return this.categoryTypeService.remove(+id);
  }

  // =========================================
  // Plant Type Management Endpoints
  // =========================================
  @Post('/plant-type')
  @PlantTypeDocs.create()
  createPlantType(@Body() dto: CreatePlantTypeDto) {
    return this.plantTypeService.create(dto);
  }

  @Get('/plant-types')
  @PlantTypeDocs.findAll()
  findAllPlantTypes(@Query('title') title?: string) {
    if (title) {
      return this.plantTypeService.findByTitle(title);
    }
    return this.plantTypeService.findAll();
  }

  @Get('/plant-type/:id')
  @PlantTypeDocs.findOne()
  findOnePlantType(@Param('id') id: string) {
    return this.plantTypeService.findOne(+id);
  }

  @Patch('/plant-type/:id')
  @PlantTypeDocs.update()
  updatePlantType(@Param('id') id: string, @Body() dto: UpdatePlantTypeDto) {
    return this.plantTypeService.update(+id, dto);
  }

  @Delete('/plant-type/:id')
  @PlantTypeDocs.remove()
  removePlantType(@Param('id') id: string) {
    return this.plantTypeService.remove(+id);
  }

  // =========================================
  // Object Profile Management Endpoints
  // =========================================
  @Post('/object-profile')
  @ObjectProfileDocs.create()
  createObjectProfile(@Body() dto: CreateObjectProfileDto) {
    return this.objectProfileService.create(dto);
  }

  @Get('/object-profiles')
  @ObjectProfileDocs.findAll()
  findAllObjectProfiles(
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

  @Get('/object-profile/:id')
  @ObjectProfileDocs.findOne()
  findOneObjectProfile(@Param('id') id: string) {
    return this.objectProfileService.findOne(+id);
  }

  @Patch('/object-profile/:id')
  @ObjectProfileDocs.update()
  updateObjectProfile(@Param('id') id: string, @Body() dto: UpdateObjectProfileDto) {
    return this.objectProfileService.update(+id, dto);
  }

  @Delete('/object-profile/:id')
  @ObjectProfileDocs.remove()
  removeObjectProfile(@Param('id') id: string) {
    return this.objectProfileService.remove(+id);
  }

  // =========================================
  // Contact Management Endpoints
  // =========================================
  @Post('/contact')
  @ContactDocs.create()
  createContact(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Get('/contacts')
  @ContactDocs.findAll()
  findAllContacts(
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

  @Get('/contact/:id')
  @ContactDocs.findOne()
  findOneContact(@Param('id') id: string) {
    return this.contactService.findOne(+id);
  }

  @Patch('/contact/:id')
  @ContactDocs.update()
  updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactService.update(+id, dto);
  }

  @Delete('/contact/:id')
  @ContactDocs.remove()
  removeContact(@Param('id') id: string) {
    return this.contactService.remove(+id);
  }

  // =========================================
  // Avatar Management Endpoints
  // =========================================
  @Post('/avatar')
  @AvatarDocs.create()
  createAvatar(@Body() dto: CreateAvatarDto) {
    return this.avatarService.create(dto);
  }

  @Get('/avatars')
  @AvatarDocs.findAll()
  findAllAvatars() {
    return this.avatarService.findAll();
  }

  @Get('/avatar/search')
  @AvatarDocs.findByTitle()
  findAvatarByTitle(@Query('title') title: string) {
    return this.avatarService.findByTitle(title);
  }

  @Get('/avatar/plant-type/:plantTypeId')
  @AvatarDocs.findByPlantType()
  findAvatarsByPlantType(@Param('plantTypeId') plantTypeId: string) {
    return this.avatarService.findByPlantType(+plantTypeId);
  }

  @Get('/avatar/:id')
  @AvatarDocs.findOne()
  findOneAvatar(@Param('id') id: string) {
    return this.avatarService.findOne(+id);
  }

  @Patch('/avatar/:id')
  @AvatarDocs.update()
  updateAvatar(@Param('id') id: string, @Body() dto: UpdateAvatarDto) {
    return this.avatarService.update(+id, dto);
  }

  @Delete('/avatar/:id')
  @AvatarDocs.remove()
  removeAvatar(@Param('id') id: string) {
    return this.avatarService.remove(+id);
  }

  // =========================================
  // Person Parameter Management Endpoints
  // =========================================
  @Post('/person-parameter')
  @PersonParameterDocs.create()
  createPersonParameter(@Body() dto: CreatePersonParameterDto) {
    return this.personParameterService.create(dto);
  }

  @Get('/person-parameters')
  @PersonParameterDocs.findAll()
  findAllPersonParameters() {
    return this.personParameterService.findAll();
  }

  @Get('/person-parameter/:id')
  @PersonParameterDocs.findOne()
  findOnePersonParameter(@Param('id') id: string) {
    return this.personParameterService.findOne(+id);
  }

  @Patch('/person-parameter/:id')
  @PersonParameterDocs.update()
  updatePersonParameter(@Param('id') id: string, @Body() dto: UpdatePersonParameterDto) {
    return this.personParameterService.update(+id, dto);
  }

  @Delete('/person-parameter/:id')
  @PersonParameterDocs.remove()
  removePersonParameter(@Param('id') id: string) {
    return this.personParameterService.remove(+id);
  }

  // =========================================
  // Parameter Type Management Endpoints
  // =========================================
  @Post('/parameter-type')
  @ParameterTypeDocs.create()
  createParameterType(@Body() dto: CreateParameterTypeDto) {
    return this.parameterTypeService.create(dto);
  }

  @Get('/parameter-types')
  @ParameterTypeDocs.findAll()
  findAllParameterTypes() {
    return this.parameterTypeService.findAll();
  }

  @Get('/parameter-type/search')
  @ParameterTypeDocs.findByTitle()
  findParameterTypeByTitle(@Query('title') title: string) {
    return this.parameterTypeService.findByTitle(title);
  }

  @Get('/parameter-type/:id')
  @ParameterTypeDocs.findOne()
  findOneParameterType(@Param('id') id: string) {
    return this.parameterTypeService.findOne(+id);
  }

  @Patch('/parameter-type/:id')
  @ParameterTypeDocs.update()
  updateParameterType(@Param('id') id: string, @Body() dto: UpdateParameterTypeDto) {
    return this.parameterTypeService.update(+id, dto);
  }

  @Delete('/parameter-type/:id')
  @ParameterTypeDocs.remove()
  removeParameterType(@Param('id') id: string) {
    return this.parameterTypeService.remove(+id);
  }

  // =========================================
  // Object Management Endpoints
  // =========================================
  @Post('object')
  @ObjectDocs.create()
  createObject(@Body() createObjectDto: CreateObjectDto) {
    return this.objectService.create(createObjectDto);
  }

  @Get('objects')
  @ObjectDocs.findAll()
  findAllObjects() {
    return this.objectService.findAll();
  }

  @Get('object/search')
  @ObjectDocs.findByTitle()
  findObjectsByTitle(@Query('title') title: string) {
    return this.objectService.findByTitle(title);
  }

  @Get('object/:id')
  @ObjectDocs.findOne()
  findOneObject(@Param('id') id: string) {
    return this.objectService.findOne(+id);
  }

  @Patch('object/:id')
  @ObjectDocs.update()
  updateObject(@Param('id') id: string, @Body() updateObjectDto: UpdateObjectDto) {
    return this.objectService.update(+id, updateObjectDto);
  }

  @Delete('object/:id')
  @ObjectDocs.remove()
  removeObject(@Param('id') id: string) {
    return this.objectService.remove(+id);
  }

  // =========================================
  // Relationship Management Endpoints
  // =========================================
  @Post('/relationship')
  @RelationshipDocs.create()
  createRelationship(@Body() dto: CreateRelationshipDto) {
    return this.relationshipService.create(dto);
  }

  @Get('/relationships')
  @RelationshipDocs.findAll()
  findAllRelationships(@Query('title') title?: string) {
    if (title) {
      return this.relationshipService.findByTitle(title);
    }
    return this.relationshipService.findAll();
  }

  @Get('/relationship/:id')
  @RelationshipDocs.findOne()
  findOneRelationship(@Param('id') id: string) {
    return this.relationshipService.findOne(+id);
  }

  @Patch('/relationship/:id')
  @RelationshipDocs.update()
  updateRelationship(@Param('id') id: string, @Body() dto: UpdateRelationshipDto) {
    return this.relationshipService.update(+id, dto);
  }

  @Delete('/relationship/:id')
  @RelationshipDocs.remove()
  removeRelationship(@Param('id') id: string) {
    return this.relationshipService.remove(+id);
  }

  // =========================================
  // Notification Management Endpoints
  // =========================================
  @Post('/notification')
  @NotificationDocs.create()
  createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get('/notifications')
  @NotificationDocs.findAll()
  findAllNotifications(@Query('personId') personId?: number) {
    if (personId) {
      return this.notificationService.findByPerson(personId);
    }
    return this.notificationService.findAll();
  }

  @Get('/notification/:id')
  @NotificationDocs.findOne()
  findOneNotification(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch('/notification/:id')
  @NotificationDocs.update()
  updateNotification(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    return this.notificationService.update(+id, dto);
  }

  @Delete('/notification/:id')
  @NotificationDocs.remove()
  removeNotification(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
