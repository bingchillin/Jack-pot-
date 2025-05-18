import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComposantService } from './composant.service';
import { ComposantController } from './composant.controller';
import { Composant } from './entities/composant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Composant])],
    controllers: [ComposantController],
    providers: [ComposantService],
    exports: [ComposantService]
})
export class ComposantModule {} 