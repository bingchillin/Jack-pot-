import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { UserModule } from 'src/user/user.module';
import {SensorModule} from "../sensor/sensor.module";
import {AuthModule} from "../auth/auth.module";

@Module({
  controllers: [ApiController],
  providers: [ApiService],
  imports: [UserModule, SensorModule, AuthModule]
})
export class ApiModule { }
