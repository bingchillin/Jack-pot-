import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {jwtConstants} from './constants';
import {Request as RequestType} from 'express';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtStrategy.extractJWT,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        // Check if token is expired
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            throw new UnauthorizedException('Token has expired');
        }

        // Validate required claims
        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException('Invalid token payload');
        }

        return {
            id: payload.sub,
            email: payload.email,
            name: payload.name
        };
    }

    private static extractJWT(req: RequestType): string | null {
        if (
            req.cookies
            && 'user_token' in req.cookies
            && req.cookies.user_token.length > 0
        ) {
            return req.cookies.user_token;
        }
        return null;
    }
}