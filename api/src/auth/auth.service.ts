import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PersonService } from "../person/person.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';

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

    async signup(signupDto: SignupDto) {
        // Check if user already exists
        const existingUser = await this.personService.findByEmail(signupDto.email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(signupDto.password, 10);

        // Create new user with default role (assuming role ID 2 is for regular users)
        const newUser = await this.personService.create({
            ...signupDto,
            password: hashedPassword,
            idRole: 2, // Default role for new users
        });

        // Generate tokens
        const tokens = await this.generateTokens(newUser);

        return {
            ...tokens,
            user: {
                idPerson: newUser.idPerson,
                email: newUser.email,
                firstname: newUser.firstname,
                surname: newUser.surname,
                numberPhone: newUser.numberPhone,
            },
        };
    }

    async login(user: any) {
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: {
                idPerson: user.idPerson,
                email: user.email,
                firstname: user.firstname,
                surname: user.surname,
                numberPhone: user.numberPhone,
            },
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
            
            this.logger.debug(`Token refreshed successfully for user: ${person.email}`);
            return this.login(person);
        } catch (e) {
            this.logger.warn('Token refresh failed - Invalid refresh token');
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private async generateTokens(user: any) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: user.idPerson,
                    email: user.email,
                },
                {
                    secret: process.env.JWT_SECRET,
                    expiresIn: '1h',
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: user.idPerson,
                    email: user.email,
                },
                {
                    secret: process.env.JWT_REFRESH_SECRET,
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600,
        };
    }
}