import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamePersonService } from './game-person.service';
import { GamePersonController } from './game-person.controller';
import { GamePerson } from './entities/game-person.entity';

@Module({
    imports: [TypeOrmModule.forFeature([GamePerson])],
    controllers: [GamePersonController],
    providers: [GamePersonService],
    exports: [GamePersonService]
})
export class GamePersonModule {} 