import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantTypeService } from './plant-type.service';
import { PlantTypeController } from './plant-type.controller';
import { PlantType } from './entities/plant-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PlantType])],
    controllers: [PlantTypeController],
    providers: [PlantTypeService],
    exports: [PlantTypeService]
})
export class PlantTypeModule {} 