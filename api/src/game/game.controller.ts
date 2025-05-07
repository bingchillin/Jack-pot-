import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateGameDto })
    create(@Body() createGameDto: CreateGameDto) {
        return this.gameService.create(createGameDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findAll() {
        return this.gameService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.gameService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateGameDto })
    update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
        return this.gameService.update(+id, updateGameDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.gameService.remove(+id);
    }
} 