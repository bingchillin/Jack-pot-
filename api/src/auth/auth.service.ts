import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PersonService } from "../person/person.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly personService: PersonService,
        private jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        this.logger.debug(`Attempting to validate user: ${email}`);
        
        const person = await this.personService.findByEmail(email);
        if (!person) {
            this.logger.warn(`Login attempt failed for non-existent user: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatching = await bcrypt.compare(password, person.password);
        if (!isPasswordMatching) {
            this.logger.warn(`Login attempt failed for user: ${email} - Invalid password`);
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.debug(`User validated successfully: ${email}`);
        const { password: _, ...result } = person;
        return result;
    }

    async login(person: any) {
        this.logger.debug(`Generating tokens for user: ${person.mail}`);
        
        const payload = {
            sub: person.idPerson,
            email: person.mail,
            name: `${person.firstname} ${person.surname}`,
            iat: Math.floor(Date.now() / 1000)
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.sign(payload),
            this.jwtService.sign(
                { sub: person.idPerson },
                { expiresIn: '7d' }
            ),
        ]);

        this.logger.debug(`Tokens generated successfully for user: ${person.mail}`);
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
            const person = await this.personService.findOne(payload.sub);
            if (!person) {
                this.logger.warn(`Token refresh failed - User not found: ${payload.sub}`);
                throw new UnauthorizedException();
            }
            
            this.logger.debug(`Token refreshed successfully for user: ${person.mail}`);
            return this.login(person);
        } catch (e) {
            this.logger.warn('Token refresh failed - Invalid refresh token');
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}