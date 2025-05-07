import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { EventPartyService } from './event-party.service';
import { CreateEventPartyDto } from './dto/create-event-party.dto';
import { UpdateEventPartyDto } from './dto/update-event-party.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('event-party')
@UseGuards(JwtAuthGuard)
export class EventPartyController {
    constructor(private readonly eventPartyService: EventPartyService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateEventPartyDto })
    create(@Body() createEventPartyDto: CreateEventPartyDto) {
        return this.eventPartyService.create(createEventPartyDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findAll() {
        return this.eventPartyService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.eventPartyService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateEventPartyDto })
    update(@Param('id') id: string, @Body() updateEventPartyDto: UpdateEventPartyDto) {
        return this.eventPartyService.update(+id, updateEventPartyDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.eventPartyService.remove(+id);
    }
} 