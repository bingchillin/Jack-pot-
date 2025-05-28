import { ApiGroup } from '../decorator/api-group.decorator';
import { LoginDto } from '../../auth/dto/login.dto';
import { SignupDto } from '../../auth/dto/signup.dto';
import { VerifyEmailDto } from '../../auth/dto/verify-email.dto';
import { RequestPasswordResetDto } from '../../auth/dto/request-password-reset.dto';
import { ResetPasswordDto } from '../../auth/dto/reset-password.dto';
import { VerifyEmailCodeDto } from '../../auth/dto/verify-email-code.dto';

export const AuthDocs = {
    signup: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'User signup',
            description: 'Creates a new user account and returns authentication tokens.',
            bodyType: SignupDto,
            bodyExample: {
                email: 'john.doe@example.com',
                password: 'securePassword123',
                firstname: 'John',
                surname: 'Doe',
                numberPhone: '+33612345678'
            },
            responses: [
                {
                    status: 201,
                    description: 'User created successfully',
                    example: {
                        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        expires_in: 3600,
                        user: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe',
                            numberPhone: '+33612345678',
                            isEmailVerified: false
                        }
                    }
                },
                {
                    status: 400,
                    description: 'Invalid input data',
                    example: {
                        statusCode: 400,
                        message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 409,
                    description: 'User already exists',
                    example: {
                        statusCode: 409,
                        message: 'User already exists',
                        error: 'Conflict'
                    }
                }
            ],
        }),

    login: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'User login',
            description: 'Authenticates a user and returns authentication tokens.',
            bodyType: LoginDto,
            bodyExample: {
                email: 'john.doe@example.com',
                password: 'securePassword123'
            },
            responses: [
                {
                    status: 200,
                    description: 'Login successful',
                    example: {
                        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        expires_in: 3600,
                        user: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe',
                            numberPhone: '+33612345678'
                        }
                    }
                },
                {
                    status: 401,
                    description: 'Invalid credentials',
                    example: {
                        statusCode: 401,
                        message: 'Invalid credentials',
                        error: 'Unauthorized'
                    }
                }
            ],
        }),

    refresh: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Refresh access token',
            description: 'Refreshes the access token using a valid refresh token.',
            bodyExample: {
                refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            responses: [
                {
                    status: 200,
                    description: 'Token refreshed successfully',
                    example: {
                        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        expires_in: 3600,
                        user: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe',
                            numberPhone: '+33612345678'
                        }
                    }
                },
                {
                    status: 401,
                    description: 'Invalid refresh token',
                    example: {
                        statusCode: 401,
                        message: 'Invalid refresh token',
                        error: 'Unauthorized'
                    }
                }
            ],
        }),

    logout: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'User logout',
            description: 'Invalidates the current user session and token.',
            responses: [
                {
                    status: 200,
                    description: 'Logout successful',
                    example: {
                        message: "Successfully logged out"
                    }
                },
                {
                    status: 401,
                    description: 'Unauthorized',
                    example: {
                        statusCode: 401,
                        message: "Unauthorized",
                        error: "Unauthorized"
                    }
                }
            ],
        }),

    me: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Get current user',
            description: 'Retrieves the currently authenticated user\'s information.',
            responses: [
                {
                    status: 200,
                    description: 'User information retrieved successfully',
                    example: {
                        idPerson: 1,
                        email: "john.doe@example.com",
                        firstname: "John",
                        surname: "Doe",
                        numberPhone: "+33612345678",
                        idRole: 1
                    }
                },
                {
                    status: 401,
                    description: 'Unauthorized',
                    example: {
                        statusCode: 401,
                        message: "Unauthorized",
                        error: "Unauthorized"
                    }
                }
            ],
        }),

    verifyEmail: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Verify user email address',
            description: 'Verifies a user\'s email address using the token sent to their email.',
            bodyType: VerifyEmailDto,
            bodyExample: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            responses: [
                {
                    status: 200,
                    description: 'Email verified successfully',
                    example: {
                        message: 'Email verified successfully'
                    }
                },
                {
                    status: 400,
                    description: 'Invalid verification token',
                    example: {
                        statusCode: 400,
                        message: 'Invalid verification token',
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    resendVerification: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Resend verification email',
            description: 'Resends the verification email to an unverified user.',
            bodyExample: {
                email: 'john.doe@example.com'
            },
            responses: [
                {
                    status: 200,
                    description: 'Verification email sent successfully',
                    example: {
                        message: 'Verification email sent successfully'
                    }
                },
                {
                    status: 400,
                    description: 'User not found or already verified',
                    example: {
                        statusCode: 400,
                        message: 'User not found or already verified',
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    requestPasswordReset: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Request password reset',
            description: 'Sends a password reset link to the user\'s email address.',
            bodyType: RequestPasswordResetDto,
            bodyExample: {
                email: 'john.doe@example.com'
            },
            responses: [
                {
                    status: 200,
                    description: 'Password reset email sent',
                    example: {
                        message: 'If your email is registered, you will receive a password reset link'
                    }
                }
            ],
        }),

    resetPassword: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Reset password',
            description: 'Resets the user\'s password using a valid reset token.',
            bodyType: ResetPasswordDto,
            bodyExample: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                newPassword: 'newSecurePassword123'
            },
            responses: [
                {
                    status: 200,
                    description: 'Password reset successfully',
                    example: {
                        message: 'Password reset successfully'
                    }
                },
                {
                    status: 400,
                    description: 'Invalid or expired reset token',
                    example: {
                        statusCode: 400,
                        message: 'Invalid or expired reset token',
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    verifyEmailCode: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Verify user email address with code',
            description: 'Verifies a user\'s email address using the 6-digit code sent to their email.',
            bodyType: VerifyEmailCodeDto,
            bodyExample: {
                email: 'user@example.com',
                code: '123456'
            },
            responses: [
                {
                    status: 200,
                    description: 'Email verified successfully',
                    example: {
                        message: 'Email verified successfully'
                    }
                },
                {
                    status: 400,
                    description: 'Invalid verification code or code expired',
                    example: {
                        statusCode: 400,
                        message: 'Invalid verification code',
                        error: 'Bad Request'
                    }
                }
            ],
        }),
}; 