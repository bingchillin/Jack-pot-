import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectProfileService } from './object-profile.service';
import { ObjectProfileController } from './object-profile.controller';
import { ObjectProfileElecController } from './object-profile-elec.controller';
import { ObjectProfile } from './entities/object-profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ObjectProfile])],
    controllers: [ObjectProfileController,ObjectProfileElecController],
    providers: [ObjectProfileService],
    exports: [ObjectProfileService]
})
export class ObjectProfileModule {} 