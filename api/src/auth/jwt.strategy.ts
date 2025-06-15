import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {jwtConstants} from './constants';
import {Request as RequestType} from 'express';
import {ConfigService} from '@nestjs/config';
import { PersonService } from '../person/person.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly personService: PersonService
    ) {
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

        // Get the full user object from the database
        const user = await this.personService.findOne(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            idPerson: user.idPerson,
            email: user.email,
            firstname: user.firstname,
            surname: user.surname,
            idRole: user.idRole
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