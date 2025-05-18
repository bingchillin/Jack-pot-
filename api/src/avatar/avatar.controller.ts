import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AvatarService } from './avatar.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { Avatar } from './entities/avatar.entity';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('avatars')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createAvatarDto: CreateAvatarDto): Promise<Avatar> {
    return this.avatarService.create(createAvatarDto);
  }

  @Get()
  @ApiExcludeEndpoint()
  findAll(): Promise<Avatar[]> {
    return this.avatarService.findAll();
  }

  @Get('search')
  @ApiExcludeEndpoint()
  findByTitle(@Query('title') title: string): Promise<Avatar> {
    return this.avatarService.findByTitle(title);
  }

  @Get('plant-type/:plantTypeId')
  @ApiExcludeEndpoint()
  findByPlantType(@Param('plantTypeId') plantTypeId: string): Promise<Avatar[]> {
    return this.avatarService.findByPlantType(+plantTypeId);
  }

  @Get(':id')
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string): Promise<Avatar> {
    return this.avatarService.findOne(+id);
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: string,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ): Promise<Avatar> {
    return this.avatarService.update(+id, updateAvatarDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string): Promise<void> {
    return this.avatarService.remove(+id);
  }
} 