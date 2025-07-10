import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectProfileService } from './object-profile.service';
import { ObjectProfileController } from './object-profile.controller';
import { ObjectProfileElecController } from './object-profile-elec.controller';
import { ObjectProfile } from './entities/object-profile.entity';
import { NotificationModule } from '../notification/notification.module';
import { PersonModule } from '../person/person.module';
import { PlantCareModule } from '../plant-care/plant-care.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ObjectProfile]),
        NotificationModule,
        PersonModule,
        PlantCareModule,
    ],
    controllers: [ObjectProfileController, ObjectProfileElecController],
    providers: [ObjectProfileService],
    exports: [ObjectProfileService]
})
export class ObjectProfileModule {} 