import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonParameterService } from './person-parameter.service';
import { PersonParameterController } from './person-parameter.controller';
import { PersonParameter } from './entities/person-parameter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonParameter])],
  controllers: [PersonParameterController],
  providers: [PersonParameterService],
  exports: [PersonParameterService],
})
export class PersonParameterModule {} 