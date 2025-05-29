import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { PersonService } from "../person/person.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from '../mailer/mailer.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly personService: PersonService,
        private jwtService: JwtService,
        private readonly mailerService: MailerService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {

        const person = await this.personService.findByEmail(email);
        if (!person) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatching = await bcrypt.compare(password, person.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _, ...result } = person;
        return result;
    }

    async signup(signupDto: SignupDto) {
        // Check if user already exists
        const existingUser = await this.personService.findByEmail(signupDto.email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        // Create new user with default role and verification code
        const newUser = await this.personService.create({
            ...signupDto,
            idRole: 2,
            isEmailVerified: false
        });

        // Send verification email
        await this.mailerService.sendVerificationEmail(newUser.email, signupDto.verificationCode);

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
                isEmailVerified: newUser.isEmailVerified
            },
        };
    }

    async verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto) {
        const person = await this.personService.findByEmail(verifyEmailCodeDto.email);

        if (!person) {
            throw new BadRequestException('User not found');
        }

        if (person.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        if (!person.verificationCode || !person.verificationCodeExpires) {
            throw new BadRequestException('No verification code found');
        }

        if (person.verificationCodeExpires < new Date()) {
            throw new BadRequestException('Verification code has expired');
        }

        if (person.verificationCode !== verifyEmailCodeDto.code) {
            throw new BadRequestException('Invalid verification code');
        }

        // Update user verification status
        person.isEmailVerified = true;
        await this.personService.update(person.idPerson, person);

        return { message: 'Email verified successfully' };
    }

    async resendVerification(email: string) {
        const person = await this.personService.findByEmail(email);

        if (!person) {
            throw new BadRequestException('User not found');
        }

        if (person.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        // Generate new verification code
        const verificationCode = this.generateVerificationCode();
        const verificationCodeExpires = this.setVerificationCodeExpiration();

        // Update user with new code
        person.verificationCode = verificationCode;
        person.verificationCodeExpires = verificationCodeExpires;
        await this.personService.update(person.idPerson, person);

        // Send verification email
        await this.mailerService.sendVerificationEmail(person.email, verificationCode);

        return { message: 'Verification email sent successfully' };
    }

    private generateVerificationCode(): string {
        // Generate a 6-digit code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private setVerificationCodeExpiration(): Date {
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Code expires in 1 hour
        return expires;
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
                idRole: user.idRole,
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

    async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
        const person = await this.personService.findByEmail(requestPasswordResetDto.email);

        if (!person) {
            // Don't reveal that the email doesn't exist
            return { message: 'If your email is registered, you will receive a password reset link' };
        }

        try {
            await this.mailerService.sendPasswordResetEmail(person.email, requestPasswordResetDto.verificationCode);
            return { message: 'If your email is registered, you will receive a password reset link' };
        } catch (error) {
            // Log the error for monitoring
            this.logger.error('Failed to send password reset email:', error);

            // Throw a BadRequestException which will result in a 400 status code
            throw new BadRequestException('Failed to send password reset email. Please try again later.');
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const person = await this.personService.findByEmail(resetPasswordDto.email);

        if (!person) {
            return { message: 'If your email is registered, you will receive a password reset link' };
        }

        // Verify current password
        const isPasswordMatching = await bcrypt.compare(resetPasswordDto.currentPassword, person.password);
        if (!isPasswordMatching) {
            this.logger.warn(`Password reset attempt failed: Invalid current password for user ${person.idPerson}`);
            throw new UnauthorizedException({
                message: 'Current password is incorrect',
                error: 'INVALID_CURRENT_PASSWORD',
                statusCode: 401
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

        // Update the password
        await this.personService.update(person.idPerson, {
            password: hashedPassword
        });

        this.logger.log(`Password successfully reset for user ${person.idPerson}`);
        return { message: 'Password reset successfully' };
    } catch(error) {
        if (error instanceof UnauthorizedException) {
            throw error; // Re-throw UnauthorizedException as is
        }

        throw new BadRequestException({
            message: 'Failed to reset password',
            error: 'PASSWORD_RESET_FAILED',
            statusCode: 400,
            details: error.message
        });
    }
}
