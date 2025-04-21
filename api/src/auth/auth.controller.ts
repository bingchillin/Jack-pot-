import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { AuthDocs } from 'src/api/swagger/auth.docs';

@Controller('auth/user')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @AuthDocs.login()
    async login(@Req() req: Request) {
        return this.authService.login(req.user);
    }

    @Post('refresh')
    @AuthDocs.refresh()
    async refreshToken(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }
} 