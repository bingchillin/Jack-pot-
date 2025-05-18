import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonParameterService } from './person-parameter.service';
import { CreatePersonParameterDto } from './dto/create-person-parameter.dto';
import { UpdatePersonParameterDto } from './dto/update-person-parameter.dto';
import { PersonParameter } from './entities/person-parameter.entity';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('person-parameters')
export class PersonParameterController {
  constructor(private readonly personParameterService: PersonParameterService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createPersonParameterDto: CreatePersonParameterDto): Promise<PersonParameter> {
    return this.personParameterService.create(createPersonParameterDto);
  }

  @Get()
  @ApiExcludeEndpoint()
  findAll(): Promise<PersonParameter[]> {
    return this.personParameterService.findAll();
  }

  @Get('search')
  @ApiExcludeEndpoint()
  findByTitle(@Query('title') title: string): Promise<PersonParameter> {
    return this.personParameterService.findByTitle(title);
  }

  @Get('person/:personId')
  @ApiExcludeEndpoint()
  findByPerson(@Param('personId') personId: string): Promise<PersonParameter[]> {
    return this.personParameterService.findByPerson(+personId);
  }

  @Get('parameter-type/:parameterTypeId')
  @ApiExcludeEndpoint()
  findByParameterType(@Param('parameterTypeId') parameterTypeId: string): Promise<PersonParameter[]> {
    return this.personParameterService.findByParameterType(+parameterTypeId);
  }

  @Get('person/:personId/parameter-type/:parameterTypeId')
  @ApiExcludeEndpoint()
  findByPersonAndParameterType(
    @Param('personId') personId: string,
    @Param('parameterTypeId') parameterTypeId: string,
  ): Promise<PersonParameter> {
    return this.personParameterService.findByPersonAndParameterType(+personId, +parameterTypeId);
  }

  @Get(':id')
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string): Promise<PersonParameter> {
    return this.personParameterService.findOne(+id);
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: string,
    @Body() updatePersonParameterDto: UpdatePersonParameterDto,
  ): Promise<PersonParameter> {
    return this.personParameterService.update(+id, updatePersonParameterDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string): Promise<void> {
    return this.personParameterService.remove(+id);
  }
} 