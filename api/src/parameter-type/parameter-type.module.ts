import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParameterTypeService } from './parameter-type.service';
import { ParameterTypeController } from './parameter-type.controller';
import { ParameterType } from './entities/parameter-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParameterType])],
  controllers: [ParameterTypeController],
  providers: [ParameterTypeService],
  exports: [ParameterTypeService],
})
export class ParameterTypeModule {} 