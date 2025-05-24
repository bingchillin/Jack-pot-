import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {PersonModule} from "../person/person.module";
import {PassportModule} from '@nestjs/passport';
import {LocalStrategy} from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import {JwtStrategy} from "./jwt.strategy";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { MailerModule } from '../mailer/mailer.module';

@Module({
    imports: [
        PersonModule,
        PassportModule,
        ConfigModule,
        MailerModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRATION', '1h'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
