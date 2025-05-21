import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { AuthDocs } from 'src/api/swagger/auth.docs';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth/user')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @AuthDocs.signup()
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    @AuthDocs.login()
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.login(req.user);
    }

    @Post('refresh')
    @AuthDocs.refresh()
    async refreshToken(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }
} 