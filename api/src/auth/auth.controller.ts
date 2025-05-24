import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { AuthDocs } from 'src/api/swagger/auth.docs';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @AuthDocs.signup()
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

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

    @Post('verify-email')
    @AuthDocs.verifyEmail()
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto);
    }

    @Post('request-password-reset')
    @AuthDocs.requestPasswordReset()
    async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
        return this.authService.requestPasswordReset(requestPasswordResetDto);
    }

    @Post('reset-password')
    @AuthDocs.resetPassword()
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
} 