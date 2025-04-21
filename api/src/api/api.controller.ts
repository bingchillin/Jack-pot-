import {Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import {ApiService} from './api.service';
import {UserService} from '../user/user.service';
import {SensorService} from '../sensor/sensor.service';
import {LocalAuthGuard} from "../auth/local-auth.guard";
import {AuthService} from "../auth/auth.service";

@Controller('api')
export class ApiController {
    constructor(
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly sensorService: SensorService,
        private readonly authService: AuthService,
    ) {}

    @Get('/users')
    async findAllUsers() {
        return await this.userService.findAll();
    }

    @Get('/sensors')
    async findAllSensors() {
        return await this.sensorService.findAll();
    }

    @UseGuards(LocalAuthGuard)
    @Post('auth/login/')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
}
