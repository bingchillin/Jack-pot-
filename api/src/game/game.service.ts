import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
    ) {}

    async create(createGameDto: CreateGameDto): Promise<Game> {
        const game = this.gameRepository.create(createGameDto);
        return await this.gameRepository.save(game);
    }

    async findAll(): Promise<Game[]> {
        return await this.gameRepository.find({
            relations: ['eventParty']
        });
    }

    async findOne(id: number): Promise<Game> {
        const game = await this.gameRepository.findOne({ 
            where: { idGame: id },
            relations: ['eventParty']
        });
        if (!game) {
            throw new NotFoundException(`Game with ID ${id} not found`);
        }
        return game;
    }

    async update(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
        const game = await this.findOne(id);
        Object.assign(game, updateGameDto);
        return await this.gameRepository.save(game);
    }

    async remove(id: number): Promise<void> {
        const game = await this.findOne(id);
        await this.gameRepository.remove(game);
    }
} 