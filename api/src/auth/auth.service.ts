import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { PersonService } from "../person/person.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailerService } from '../mailer/mailer.service';
import { StripeService } from '../stripe/stripe.service';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
    private readonly RESET_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
    private readonly VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
    private readonly RESET_TOKEN_EXPIRY = '10m'; // 10 minutes
    private readonly logger = new Logger(AuthService.name);

    // Store invalidated tokens
    private invalidatedTokens: Set<string> = new Set();

    constructor(
        private readonly personService: PersonService,
        private jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly stripeService: StripeService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) { }

    async validateUser(email: string, password: string, client?: string): Promise<any> {
        const person = await this.personService.findByEmail(email);
        if (!person) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatching = await bcrypt.compare(password, person.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is admin (role ID 1) only for backoffice
        if (client === 'backoffice' && person.idRole !== 1) {
            throw new UnauthorizedException('You do not have permission to access the backoffice');
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

        // Generate verification code on the backend
        const verificationCode = this.generateVerificationCode();
        const verificationCodeExpires = this.setVerificationCodeExpiration();

        // Create new user with default role and verification code
        const newUser = await this.personService.create({
            ...signupDto,
            idRole: 2,
            isEmailVerified: false,
            verificationCode,
            verificationCodeExpires
        });

        const fullPerson = await this.personService.findOne(newUser.idPerson);

        let updatedPerson = fullPerson;
        try {
            const stripeCustomer = await this.stripeService.createCustomer(fullPerson);
            updatedPerson = await this.personService.updateStripeCustomerId(newUser.idPerson, stripeCustomer.id);
        } catch (error) {
            this.logger.error(`❌ Failed to create Stripe customer for user ${newUser.idPerson}:`, error);
            this.logger.error('Error details:', {
                message: error.message,
                type: error.type,
                code: error.code,
                statusCode: error.statusCode
            });
            // Don't fail the registration if Stripe fails, but log the error
            // The user can still use the app, and we can retry Stripe customer creation later
        }

        // Send verification email
        await this.mailerService.sendVerificationEmail(newUser.email, verificationCode);

        // Generate tokens
        const tokens = await this.generateTokens(newUser);

        return {
            ...tokens,
            user: {
                idPerson: updatedPerson.idPerson,
                email: updatedPerson.email,
                firstname: updatedPerson.firstname,
                surname: updatedPerson.surname,
                numberPhone: updatedPerson.numberPhone,
                isEmailVerified: updatedPerson.isEmailVerified,
                stripeCustomerId: updatedPerson.stripeCustomerId
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

    async login(user: any, client: string = 'mobile') {
        const tokens = await this.generateTokens(user, client);
        // Save refresh token in DB
        await this.saveRefreshToken(user.idPerson, tokens.refresh_token, tokens.expires_in);
        return {
            ...tokens,
            user: {
                idPerson: user.idPerson,
                email: user.email,
                firstname: user.firstname,
                surname: user.surname,
                idRole: user.idRole,
                numberPhone: user.numberPhone,
                isEmailVerified: user.isEmailVerified,
                stripeCustomerId: user.stripeCustomerId
            },
        };
    }

    async refreshToken(refreshToken: string, client: string = 'mobile') {
        // Validate refresh token in DB
        const tokenEntity = await this.refreshTokenRepository.findOne({ where: { token: refreshToken }, relations: ['user'] });
        if (!tokenEntity) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        // Check expiry
        if (tokenEntity.expiresAt < new Date()) {
            await this.refreshTokenRepository.delete({ token: refreshToken });
            throw new UnauthorizedException('Refresh token expired');
        }
        // Rotate: delete old, issue new
        await this.refreshTokenRepository.delete({ token: refreshToken });
        return this.login(tokenEntity.user, client);
    }

    private async generateTokens(user: any, client: string = 'mobile') {
        const accessTokenExpiresIn = client === 'backoffice' ? '15m' : '1h';
        const refreshTokenExpiresIn = client === 'backoffice' ? '2h' : '7d';
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: user.idPerson,
                    email: user.email,
                },
                {
                    secret: process.env.JWT_SECRET,
                    expiresIn: accessTokenExpiresIn,
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: user.idPerson,
                    email: user.email,
                },
                {
                    secret: process.env.JWT_REFRESH_SECRET,
                    expiresIn: refreshTokenExpiresIn,
                },
            ),
        ]);

        // Calculate expires_in in seconds
        const expiresInSeconds = client === 'backoffice' ? 15 * 60 : 3600;

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresInSeconds,
        };
    }

    private generateResetToken(email: string): string {
        // Generate a random component
        const randomComponent = crypto.randomBytes(32).toString('hex');
        const timestamp = Date.now();

        return this.jwtService.sign(
            { 
                email, 
                type: 'reset',
                random: randomComponent,
                timestamp,
                jti: crypto.randomBytes(16).toString('hex') // Unique token ID
            },
            { 
                secret: process.env.JWT_SECRET,
                expiresIn: this.RESET_TOKEN_EXPIRY
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
                verificationCodeExpires: resetCodeExpires,
                // Add a reset token version to invalidate old tokens
                resetTokenVersion: (person.resetTokenVersion || 0) + 1
            });

            // Send the reset email
            await this.mailerService.sendResetPasswordEmail(person.email, resetCode);
            
            return { message: 'Si cet email existe, un code vous a été envoyé.' };
        } catch (error) {
            this.logger.error(`Failed to process password reset request: ${error.message}`);
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

        // Generate a new token with version included
        const tokenPayload = {
            email: person.email,
            type: 'reset',
            random: crypto.randomBytes(32).toString('hex'),
            timestamp: Date.now(),
            jti: crypto.randomBytes(16).toString('hex'),
            version: person.resetTokenVersion || 0
        };

        const finalToken = this.jwtService.sign(tokenPayload, {
            secret: process.env.JWT_SECRET,
            expiresIn: this.RESET_TOKEN_EXPIRY
        });

        // Clear the verification code after successful use
        await this.personService.update(person.idPerson, {
            verificationCode: null,
            verificationCodeExpires: null
        });

        return { resetToken: finalToken };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto, resetToken: string) {
        try {
            // Check if token was invalidated
            if (this.invalidatedTokens.has(resetToken)) {
                throw new UnauthorizedException('Reset token has been invalidated');
            }

            // Verify the reset token
            const payload = await this.jwtService.verify(resetToken);
            
            if (payload.type !== 'reset') {
                throw new UnauthorizedException('Invalid reset token');
            }

            const person = await this.personService.findByEmail(payload.email);
            if (!person) {
                throw new UnauthorizedException('Invalid reset token');
            }

            // Verify token version matches current version
            if (payload.version !== person.resetTokenVersion) {
                throw new UnauthorizedException('Reset token has been invalidated');
            }

            // Update password and clear reset code
            await this.personService.update(person.idPerson, {
                password: resetPasswordDto.newPassword,
                verificationCode: null,
                verificationCodeExpires: null
            });

            // Invalidate the used token
            this.invalidatedTokens.add(resetToken);

            // Clean up old invalidated tokens (keep last 1000)
            if (this.invalidatedTokens.size > 1000) {
                const tokensArray = Array.from(this.invalidatedTokens);
                this.invalidatedTokens = new Set(tokensArray.slice(-1000));
            }

            return { message: 'Password reset successfully' };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Reset token has expired');
            }
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Failed to reset password: ${error.message}`);
            throw new BadRequestException('Failed to reset password');
        }
    }

    async saveRefreshToken(userId: number, token: string, expiresIn: number) {
        const expiresAt = new Date(Date.now() + expiresIn * 1000 * 24 * 7); // 7 days
        await this.refreshTokenRepository.save({
            token,
            user: { idPerson: userId },
            expiresAt,
        });
    }

    async revokeAllRefreshTokensForUser(userId: number) {
        await this.refreshTokenRepository.delete({ user: { idPerson: userId } });
    }

    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        // First, get the user to validate current password
        const person = await this.personService.findOne(userId);
        if (!person) {
            throw new UnauthorizedException('User not found');
        }

        // Validate current password
        const isCurrentPasswordValid = await bcrypt.compare(updateProfileDto.currentPassword, person.password);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Prepare update data (without currentPassword)
        const updateData: any = {};
        
        if (updateProfileDto.firstname !== undefined) {
            updateData.firstname = updateProfileDto.firstname;
        }
        
        if (updateProfileDto.surname !== undefined) {
            updateData.surname = updateProfileDto.surname;
        }
        
        if (updateProfileDto.numberPhone !== undefined) {
            updateData.numberPhone = updateProfileDto.numberPhone;
        }

        if (updateProfileDto.address !== undefined) {
            updateData.address = updateProfileDto.address;
        }

        // If new password is provided, hash it
        if (updateProfileDto.newPassword) {
            updateData.password = updateProfileDto.newPassword;
        }

        console.log('🔍 Backend Auth Service - Updating person with data:', updateData);
        console.log('🔍 Backend Auth Service - Person ID:', userId);

        // Update the person
        const updatedPerson = await this.personService.update(userId, updateData);
        
        console.log('🔍 Backend Auth Service - Updated person:', updatedPerson);
        
        // Return user without password
        const { password: _, ...result } = updatedPerson;
        return result;
    }

    async getProfile(userId: number) {
        const person = await this.personService.findOne(userId);
        if (!person) {
            throw new UnauthorizedException('User not found');
        }

        // Return user without password
        const { password: _, ...result } = person;
        return result;
    }
}

