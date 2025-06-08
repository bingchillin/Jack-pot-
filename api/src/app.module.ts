import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';
import { PersonModule } from './person/person.module';
import { Person } from './person/entities/person.entity';
import { Plant } from './plant/entities/plant.entity';
import { ObjectEntity } from './object/entities/object.entity';
import { CategoryType } from './category-type/entities/category-type.entity';
import { ObjectProfile } from './object-profile/entities/object-profile.entity';
import { EventParty } from './event-party/entities/event-party.entity';
import { Composant } from './composant/entities/composant.entity';
import { Role } from './role/entities/role.entity';
import { Contact } from './contact/entities/contact.entity';
import { PersonParameter } from './lnk-person-parameter/entities/person-parameter.entity';
import { Notification } from './notification/entities/notification.entity';
import { EventPartyPerson } from './event-party-person/entities/event-party-person.entity';
import { GamePerson } from './game-person/entities/game-person.entity';
import { Game } from './game/entities/game.entity';
import { ParameterType } from './parameter-type/entities/parameter-type.entity';
import { Avatar } from './avatar/entities/avatar.entity';
import { PlantPerson } from './plant-person/entities/plant-person.entity';
import { Relationship } from './relationship/entities/relationship.entity';
import { PlantType } from './plant-type/entities/plant-type.entity';

// Module imports
import { RoleModule } from './role/role.module';
import { ContactModule } from './contact/contact.module';
import { ParameterTypeModule } from './parameter-type/parameter-type.module';
import { NotificationModule } from './notification/notification.module';
import { EventPartyPersonModule } from './event-party-person/event-party-person.module';
import { GameModule } from './game/game.module';
import { AvatarModule } from './avatar/avatar.module';
import { PlantPersonModule } from './plant-person/plant-person.module';
import { RelationshipModule } from './relationship/relationship.module';
import { ObjectModule } from './object/object.module';
import { PlantModule } from './plant/plant.module';
import { CategoryTypeModule } from './category-type/category-type.module';
import { ObjectProfileModule } from './object-profile/object-profile.module';
import { EventPartyModule } from './event-party/event-party.module';
import { ComposantModule } from './composant/composant.module';
import { PlantTypeModule } from './plant-type/plant-type.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = {
          type: 'postgres' as const,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [
            Person,
            Plant,
            ObjectEntity,
            CategoryType,
            ObjectProfile,
            EventParty,
            Composant,
            Role,
            Contact,
            PersonParameter,
            Notification,
            EventPartyPerson,
            GamePerson,
            Game,
            ParameterType,
            Avatar,
            PlantPerson,
            Relationship,
            PlantType
          ],
          synchronize: false,
          autoLoadEntities: true,
        };
        console.log('Database Configuration:', {
          host: config.host,
          port: config.port,
          username: config.username,
          database: config.database,
        });
        return config;
      },
      inject: [ConfigService],
    }),
    ApiModule,
    AuthModule,
    PersonModule,
    RoleModule,
    ContactModule,
    ParameterTypeModule,
    NotificationModule,
    EventPartyPersonModule,
    GameModule,
    AvatarModule,
    PlantPersonModule,
    RelationshipModule,
    ObjectModule,
    PlantModule,
    CategoryTypeModule,
    ObjectProfileModule,
    EventPartyModule,
    ComposantModule,
    PlantTypeModule,
    MailerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }