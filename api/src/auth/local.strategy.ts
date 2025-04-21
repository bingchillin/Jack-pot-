import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email', // Specify that we use 'email' instead of 'username'
            passwordField: 'password' // This is optional since 'password' is the default
        });
    }

    async validate(email: string, password: string): Promise<any> {
        const person = await this.authService.validateUser(email, password);
        if (!person) {
            throw new UnauthorizedException();
        }
        return person;
    }
}