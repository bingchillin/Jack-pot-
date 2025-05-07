import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { GamePersonService } from './game-person.service';
import { CreateGamePersonDto } from './dto/create-game-person.dto';
import { UpdateGamePersonDto } from './dto/update-game-person.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('game-person')
@UseGuards(JwtAuthGuard)
export class GamePersonController {
    constructor(private readonly gamePersonService: GamePersonService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateGamePersonDto })
    create(@Body() createGamePersonDto: CreateGamePersonDto) {
        return this.gamePersonService.create(createGamePersonDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findAll(
        @Query('gameId') gameId?: number,
        @Query('personId') personId?: number
    ) {
        if (gameId) {
            return this.gamePersonService.findByGameId(gameId);
        }
        if (personId) {
            return this.gamePersonService.findByPersonId(personId);
        }
        return this.gamePersonService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.gamePersonService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateGamePersonDto })
    update(@Param('id') id: string, @Body() updateGamePersonDto: UpdateGamePersonDto) {
        return this.gamePersonService.update(+id, updateGamePersonDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.gamePersonService.remove(+id);
    }
} 