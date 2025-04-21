import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth/user')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns JWT tokens',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string' },
                refresh_token: { type: 'string' },
                expires_in: { type: 'number' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'test@test.com' },
                password: { type: 'string', example: 'test123' }
            }
        }
    })
    async login(@Req() req: Request) {
        return this.authService.login(req.user);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh JWT token' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns new JWT tokens',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string' },
                refresh_token: { type: 'string' },
                expires_in: { type: 'number' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                refresh_token: { type: 'string' }
            }
        }
    })
    async refreshToken(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }
} 