import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { ObjectProfileService } from './object-profile.service';
import { CreateObjectProfileDto } from './dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from './dto/update-object-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('object-profile-elec')
export class ObjectProfileElecController {
    constructor(private readonly objectProfileService: ObjectProfileService) {}

   

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateObjectProfileDto })
    update(@Param('id') id: string, @Body() updateObjectProfileDto: UpdateObjectProfileDto) {
        return this.objectProfileService.update(+id, updateObjectProfileDto);
    }

} 