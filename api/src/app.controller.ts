import {Controller, Get, Render, Request, Post, UseGuards, Res, HttpException, HttpStatus} from '@nestjs/common';
import {LocalAuthGuard} from "./auth/local-auth.guard";
import {AuthService} from './auth/auth.service';
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
    constructor(private authService: AuthService) {
    }

    @Get()
    @ApiExcludeEndpoint()
    @Render('index')
    loginPage() {
        return {layout: 'login'};
    }

    @UseGuards(LocalAuthGuard)
    @ApiExcludeEndpoint()
    @Post('auth/login')
    async login(@Request() req, @Res() res) {
        const tokens = await this.authService.login(req.user);
        res.cookie('user_token', tokens.access_token, {httpOnly: true});
        res.cookie('refresh_token', tokens.refresh_token, {httpOnly: true});
        return res.redirect('/dashboard');
    }

    @UseGuards(LocalAuthGuard)
    @Post('auth/user/login')
    async loginUser(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
