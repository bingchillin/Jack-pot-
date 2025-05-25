import { CreateAvatarDto } from '../../avatar/dto/create-avatar.dto';
import { UpdateAvatarDto } from '../../avatar/dto/update-avatar.dto';
import { Avatar } from '../../avatar/entities/avatar.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const AvatarDocs = {
    create: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Create a new avatar',
            description: 'Creates a new avatar with the provided details.',
            bodyType: CreateAvatarDto,
            bodyExample: {
                title: 'Default Avatar',
                description: 'Default avatar for new users',
                imageUrl: 'https://example.com/avatars/default.png'
            },
            responses: [
                {
                    status: 201,
                    description: 'Avatar created successfully',
                    type: Avatar,
                    example: {
                        idAvatar: 1,
                        title: 'Default Avatar',
                        description: 'Default avatar for new users',
                        imageUrl: 'https://example.com/avatars/default.png',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 400,
                    description: 'Bad request - Invalid input data',
                    example: {
                        statusCode: 400,
                        message: [
                            'title must be a string',
                            'description must be a string',
                            'imageUrl must be a URL'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Get all avatars',
            description: 'Retrieves a list of all avatars in the system.',
            responses: [{
                status: 200,
                description: 'List of avatars retrieved successfully',
                type: [Avatar],
                example: [
                    {
                        idAvatar: 1,
                        title: 'Default Avatar',
                        description: 'Default avatar for new users',
                        imageUrl: 'https://example.com/avatars/default.png',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idAvatar: 2,
                        title: 'Premium Avatar',
                        description: 'Premium avatar for VIP users',
                        imageUrl: 'https://example.com/avatars/premium.png',
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Get an avatar by ID',
            description: 'Retrieves a specific avatar by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the avatar to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Avatar found successfully',
                    type: Avatar,
                    example: {
                        idAvatar: 1,
                        title: 'Default Avatar',
                        description: 'Default avatar for new users',
                        imageUrl: 'https://example.com/avatars/default.png',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Avatar not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/avatar/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Update an avatar',
            description: 'Updates the details of an existing avatar.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the avatar to update',
                example: 1
            },
            bodyType: UpdateAvatarDto,
            bodyExample: {
                title: 'Updated Default Avatar',
                description: 'Updated default avatar for new users'
            },
            responses: [
                {
                    status: 200,
                    description: 'Avatar updated successfully',
                    type: Avatar,
                    example: {
                        idAvatar: 1,
                        title: 'Updated Default Avatar',
                        description: 'Updated default avatar for new users',
                        imageUrl: 'https://example.com/avatars/default.png',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T12:30:00.000Z'
                    }
                },
                {
                    status: 400,
                    description: 'Bad request - Invalid input data',
                    example: {
                        statusCode: 400,
                        message: [
                            'title must be a string',
                            'description must be a string'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Avatar not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/avatar/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Delete an avatar',
            description: 'Removes an avatar from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the avatar to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Avatar deleted successfully',
                    example: {
                        message: 'Avatar deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Avatar not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/avatar/4"
                    }
                }
            ],
        }),

    findByTitle: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Search avatars by title',
            description: 'Retrieves avatars that match the provided title.',
            query: {
                name: 'title',
                type: String,
                description: 'The title to search for',
                example: 'Default'
            },
            responses: [{
                status: 200,
                description: 'List of matching avatars retrieved successfully',
                type: [Avatar],
                example: [
                    {
                        idAvatar: 1,
                        title: 'Default Avatar',
                        description: 'Default avatar for new users',
                        imageUrl: 'https://example.com/avatars/default.png',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                ]
            }],
        }),

    findByPlantType: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Get avatars by plant type',
            description: 'Retrieves avatars associated with a specific plant type.',
            param: {
                name: 'plantTypeId',
                type: Number,
                description: 'The ID of the plant type',
                example: 1
            },
            responses: [{
                status: 200,
                description: 'List of avatars for the plant type retrieved successfully',
                type: [Avatar],
                example: [
                    {
                        idAvatar: 1,
                        title: 'Plant Type Avatar',
                        description: 'Avatar for plant type users',
                        imageUrl: 'https://example.com/avatars/plant.png',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                ]
            }],
        }),
}; 