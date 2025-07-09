import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectProfileService } from './object-profile.service';
import { SensorDataService } from './sensor-data.service';
import { ObjectProfileController } from './object-profile.controller';
import { ObjectProfileElecController } from './object-profile-elec.controller';
import { ObjectProfile } from './entities/object-profile.entity';
import { NotificationModule } from '../notification/notification.module';
import { PersonModule } from '../person/person.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ObjectProfile]),
        NotificationModule,
        PersonModule,
    ],
    controllers: [ObjectProfileController, ObjectProfileElecController],
    providers: [ObjectProfileService, SensorDataService],
    exports: [ObjectProfileService, SensorDataService]
})
export class ObjectProfileModule {} 