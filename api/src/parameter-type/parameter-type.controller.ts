import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParameterTypeService } from './parameter-type.service';
import { CreateParameterTypeDto } from './dto/create-parameter-type.dto';
import { UpdateParameterTypeDto } from './dto/update-parameter-type.dto';
import { ParameterType } from './entities/parameter-type.entity';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('parameter-types')
export class ParameterTypeController {
  constructor(private readonly parameterTypeService: ParameterTypeService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createParameterTypeDto: CreateParameterTypeDto): Promise<ParameterType> {
    return this.parameterTypeService.create(createParameterTypeDto);
  }

  @Get()
  @ApiExcludeEndpoint()
  findAll(): Promise<ParameterType[]> {
    return this.parameterTypeService.findAll();
  }

  @Get('search')
  @ApiExcludeEndpoint()
  findByTitle(@Query('title') title: string): Promise<ParameterType> {
    return this.parameterTypeService.findByTitle(title);
  }

  @Get(':id')
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string): Promise<ParameterType> {
    return this.parameterTypeService.findOne(+id);
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: string,
    @Body() updateParameterTypeDto: UpdateParameterTypeDto,
  ): Promise<ParameterType> {
    return this.parameterTypeService.update(+id, updateParameterTypeDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string): Promise<void> {
    return this.parameterTypeService.remove(+id);
  }
} 