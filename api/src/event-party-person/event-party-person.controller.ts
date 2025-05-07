import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { EventPartyPersonService } from './event-party-person.service';
import { CreateEventPartyPersonDto } from './dto/create-event-party-person.dto';
import { UpdateEventPartyPersonDto } from './dto/update-event-party-person.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('event-party-person')
@UseGuards(JwtAuthGuard)
export class EventPartyPersonController {
    constructor(private readonly eventPartyPersonService: EventPartyPersonService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreateEventPartyPersonDto })
    create(@Body() createEventPartyPersonDto: CreateEventPartyPersonDto) {
        return this.eventPartyPersonService.create(createEventPartyPersonDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findAll(
        @Query('eventPartyId') eventPartyId?: number,
        @Query('personId') personId?: number
    ) {
        if (eventPartyId) {
            return this.eventPartyPersonService.findByEventPartyId(eventPartyId);
        }
        if (personId) {
            return this.eventPartyPersonService.findByPersonId(personId);
        }
        return this.eventPartyPersonService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.eventPartyPersonService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateEventPartyPersonDto })
    update(@Param('id') id: string, @Body() updateEventPartyPersonDto: UpdateEventPartyPersonDto) {
        return this.eventPartyPersonService.update(+id, updateEventPartyPersonDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.eventPartyPersonService.remove(+id);
    }
} 