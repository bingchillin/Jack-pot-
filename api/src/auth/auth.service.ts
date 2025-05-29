import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { PersonService } from "../person/person.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly RESET_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds
    private readonly VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

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

        // Verification code expiry (verif code comes from frontend)
        const verificationCodeExpires = this.setVerificationCodeExpiration();

        // Create new user with default role and verification code
        const newUser = await this.personService.create({
            ...signupDto,
            idRole: 2,
            isEmailVerified: false,
            verificationCode: signupDto.verificationCode,
            verificationCodeExpires
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

        if (person.verificationCode !== verifyEmailCodeDto.verificationCode) {
            throw new BadRequestException('Invalid verification code');
        }

        // Update user verification status and clear verification code
        await this.personService.update(person.idPerson, {
            isEmailVerified: true,
            verificationCode: null,
            verificationCodeExpires: null
        });

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
        const verificationCodeExpires = new Date(Date.now() + this.VERIFICATION_CODE_EXPIRY);
        
        // Update user with new code
        await this.personService.update(person.idPerson, {
            verificationCode,
            verificationCodeExpires
        });

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

    private generateResetToken(email: string): string {
        return this.jwtService.sign(
            { email, type: 'reset' },
            { 
                secret: process.env.JWT_SECRET,
                expiresIn: '10m' // 10 minutes
            }
        );
    }

    async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
        const person = await this.personService.findByEmail(requestPasswordResetDto.email);
        
        if (!person) {
            // Don't reveal that the email doesn't exist
            return { message: 'Si cet email existe, un code vous a été envoyé.' };
        }

        try {
            // Generate reset code and expiry
            const resetCode = requestPasswordResetDto.verificationCode;
            const resetCodeExpires = new Date(Date.now() + this.RESET_CODE_EXPIRY);

            // Store the reset code and expiry
            await this.personService.update(person.idPerson, {
                verificationCode: resetCode,
                verificationCodeExpires: resetCodeExpires
            });

            // Send the reset email
            await this.mailerService.sendPasswordResetEmail(person.email, resetCode);
            
            this.logger.log(`Password reset code sent to ${person.email}`);
            return { message: 'Si cet email existe, un code vous a été envoyé.' };
        } catch (error) {
            this.logger.error(`Failed to send password reset email: ${error.message}`);
            throw new BadRequestException('Failed to process password reset request');
        }
    }

    async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto) {
        const person = await this.personService.findByEmail(verifyResetCodeDto.email);
        
        if (!person) {
            throw new BadRequestException('Code invalide ou expiré');
        }

        if (!person.verificationCode || !person.verificationCodeExpires) {
            throw new BadRequestException('Code invalide ou expiré');
        }

        if (person.verificationCodeExpires < new Date()) {
            throw new BadRequestException('Code invalide ou expiré');
        }

        if (person.verificationCode !== verifyResetCodeDto.code) {
            throw new BadRequestException('Code invalide ou expiré');
        }

        // Generate reset token
        const resetToken = this.generateResetToken(person.email);

        return { resetToken };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto, resetToken: string) {
        try {
            // Verify the reset token
            const payload = await this.jwtService.verify(resetToken);
            
            if (payload.type !== 'reset') {
                throw new UnauthorizedException('Invalid reset token');
            }

            const person = await this.personService.findByEmail(payload.email);
            if (!person) {
                throw new UnauthorizedException('Invalid reset token');
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

            // Update password and clear reset code
            await this.personService.update(person.idPerson, {
                password: hashedPassword,
                verificationCode: null,
                verificationCodeExpires: null
            });

            this.logger.log(`Password successfully reset for user ${person.idPerson}`);
            return { message: 'Password reset successfully' };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Reset token has expired');
            }
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Failed to reset password');
        }
    }
}
