import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from "../user/user.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        this.logger.debug(`Attempting to validate user: ${email}`);
        
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            this.logger.warn(`Login attempt failed for non-existent user: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            this.logger.warn(`Login attempt failed for user: ${email} - Invalid password`);
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.debug(`User validated successfully: ${email}`);
        const { password: _, ...result } = user;
        return result;
    }

    async login(user: any) {
        this.logger.debug(`Generating tokens for user: ${user.email}`);
        
        const payload = {
            sub: user._id,
            email: user.email,
            name: user.name,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.sign(payload),
            this.jwtService.sign(
                { sub: user._id },
                { expiresIn: '7d' }
            ),
        ]);

        this.logger.debug(`Tokens generated successfully for user: ${user.email}`);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600,
        };
    }

    async refreshToken(refreshToken: string) {
        this.logger.debug('Attempting to refresh token');
        
        try {
            const payload = await this.jwtService.verify(refreshToken);
            const user = await this.userService.findOne(payload.sub);
            if (!user) {
                this.logger.warn(`Token refresh failed - User not found: ${payload.sub}`);
                throw new UnauthorizedException();
            }
            
            this.logger.debug(`Token refreshed successfully for user: ${user.email}`);
            return this.login(user);
        } catch (e) {
            this.logger.warn('Token refresh failed - Invalid refresh token');
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}