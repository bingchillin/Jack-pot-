import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { AuthDocs } from 'src/api/swagger/auth.docs';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
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

    @Post('verify-email-code')
    @AuthDocs.verifyEmailCode()
    async verifyEmailCode(@Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
        return this.authService.verifyEmailCode(verifyEmailCodeDto);
    }

    @Post('resend-verification')
    @AuthDocs.resendVerification()
    async resendVerification(@Body('email') email: string) {
        return this.authService.resendVerification(email);
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