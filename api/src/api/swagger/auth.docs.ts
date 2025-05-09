import { ApiGroup } from '../decorator/api-group.decorator';

export const AuthDocs = {
    login: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'User login',
            description: 'Authenticates a user and returns a JWT token for subsequent requests.',
            bodyExample: {
                mail: "john.doe@example.com",
                password: "securePassword123"
            },
            responses: [
                {
                    status: 201,
                    description: 'Login successful',
                    example: {
                        "access_token": "this is a fake access token",
                        "refresh_token": "this is a fake refresh token",
                        "expires_in": 3600
                    }
                },
                {
                    status: 200,
                    description: 'Invalid credentials',
                    example: {
                        statusCode: 401,
                        message: "No message, just HTML",
                        error: "Unauthorized"
                    }
                }
            ],
        }),

    refresh: () =>
        ApiGroup({
            tag: 'Auth',
            summary: 'Refresh token',
            description: 'Refreshes an expired JWT token using a refresh token.',
            bodyExample: {
                refresh_token: "this is a fake refresh token"
            },
            responses: [
                {
                    status: 200,
                    description: 'Token refreshed successfully',
                    example: {
                        access_token: "this is a fake access token",
                        token_type: "Bearer",
                        expires_in: 3600
                    }
                },
                {
                    status: 401,
                    description: 'Invalid refresh token',
                    example: {
                        statusCode: 401,
                        message: "Invalid refresh token",
                        error: "Unauthorized"
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
                        mail: "john.doe@example.com",
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
}; 