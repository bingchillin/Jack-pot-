import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantPersonService } from './plant-person.service';
import { PlantPersonController } from './plant-person.controller';
import { PlantPerson } from './entities/plant-person.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PlantPerson])],
    controllers: [PlantPersonController],
    providers: [PlantPersonService],
    exports: [PlantPersonService]
})
export class PlantPersonModule {} 