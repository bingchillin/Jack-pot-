import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import {AuthModule} from "../auth/auth.module";
import { PersonModule } from '../person/person.module';

@Module({
  controllers: [ApiController],
  providers: [ApiService],
  imports: [AuthModule, PersonModule]
})
export class ApiModule { }
