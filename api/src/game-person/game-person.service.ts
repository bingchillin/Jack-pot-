import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePerson } from './entities/game-person.entity';
import { CreateGamePersonDto } from './dto/create-game-person.dto';
import { UpdateGamePersonDto } from './dto/update-game-person.dto';

@Injectable()
export class GamePersonService {
    constructor(
        @InjectRepository(GamePerson)
        private gamePersonRepository: Repository<GamePerson>,
    ) {}

    async create(createGamePersonDto: CreateGamePersonDto): Promise<GamePerson> {
        const gamePerson = this.gamePersonRepository.create(createGamePersonDto);
        return await this.gamePersonRepository.save(gamePerson);
    }

    async findAll(): Promise<GamePerson[]> {
        return await this.gamePersonRepository.find({
            relations: ['game', 'person']
        });
    }

    async findOne(id: number): Promise<GamePerson> {
        const gamePerson = await this.gamePersonRepository.findOne({ 
            where: { idGamePerson: id },
            relations: ['game', 'person']
        });
        if (!gamePerson) {
            throw new NotFoundException(`Game-Person relationship with ID ${id} not found`);
        }
        return gamePerson;
    }

    async update(id: number, updateGamePersonDto: UpdateGamePersonDto): Promise<GamePerson> {
        const gamePerson = await this.findOne(id);
        Object.assign(gamePerson, updateGamePersonDto);
        return await this.gamePersonRepository.save(gamePerson);
    }

    async remove(id: number): Promise<void> {
        const gamePerson = await this.findOne(id);
        await this.gamePersonRepository.remove(gamePerson);
    }

    async findByGameId(gameId: number): Promise<GamePerson[]> {
        return await this.gamePersonRepository.find({
            where: { game: { idGame: gameId } },
            relations: ['game', 'person']
        });
    }

    async findByPersonId(personId: number): Promise<GamePerson[]> {
        return await this.gamePersonRepository.find({
            where: { person: { idPerson: personId } },
            relations: ['game', 'person']
        });
    }
} 