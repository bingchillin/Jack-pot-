import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { AuthModule } from "../auth/auth.module";
import { PersonModule } from '../person/person.module';
import { PlantModule } from '../plant/plant.module';
import { EventPartyModule } from '../event-party/event-party.module';
import { GameModule } from '../game/game.module';
import { PlantPersonModule } from '../plant-person/plant-person.module';
import { GamePersonModule } from '../game-person/game-person.module';
import { EventPartyPersonModule } from '../event-party-person/event-party-person.module';
import { RoleModule } from '../role/role.module';
import { CategoryTypeModule } from '../category-type/category-type.module';
import { PlantTypeModule } from '../plant-type/plant-type.module';
import { ObjectProfileModule } from '../object-profile/object-profile.module';
import { ContactModule } from '../contact/contact.module';
import { AvatarModule } from '../avatar/avatar.module';
import { PersonParameterModule } from '../lnk-person-parameter/person-parameter.module';
import { ParameterTypeModule } from '../parameter-type/parameter-type.module';
import { ObjectModule } from '../object/object.module';
import { RelationshipModule } from '../relationship/relationship.module';
import { ComposantModule } from '../composant/composant.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [ApiController],
  providers: [ApiService],
  imports: [
    AuthModule, PersonModule, PlantModule, EventPartyModule, GameModule, 
    PlantPersonModule, GamePersonModule, EventPartyPersonModule, RoleModule,
    CategoryTypeModule, PlantTypeModule, ObjectProfileModule, ContactModule,
    AvatarModule, PersonParameterModule, ParameterTypeModule, ObjectModule,
    RelationshipModule, ComposantModule, NotificationModule
  ]
})
export class ApiModule { }
