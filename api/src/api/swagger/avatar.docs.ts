import { CreateAvatarDto } from 'src/avatar/dto/create-avatar.dto';
import { UpdateAvatarDto } from 'src/avatar/dto/update-avatar.dto';
import { Avatar } from 'src/avatar/entities/avatar.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const AvatarDocs = {
    create: () =>
        ApiGroup({
            tag: 'Avatars',
            summary: 'Create a new avatar',
            description: 'Creates a new avatar for a user profile.',
            bodyType: CreateAvatarDto,
            bodyExample: {
                name: "Garden Gnome",
                description: "A friendly garden gnome avatar",
                imageUrl: "https://example.com/avatars/garden-gnome.png",
                isDefault: false,
                idPerson: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Avatar created successfully',
                    type: Avatar,
                    example: {
                        idAvatar: 1,
                        name: "Garden Gnome",
                        description: "A friendly garden gnome avatar",
                        imageUrl: "https://example.com/avatars/garden-gnome.png",
                        isDefault: false,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 400,
                    description: 'Invalid input data',
                    example: {
                        statusCode: 400,
                        message: [
                            'name must be a string',
                            'description must be a string',
                            'imageUrl must be a string',
                            'isDefault must be a boolean',
                            'idPerson must be a number'
                        ],
                        error: "Bad Request"
                    }
                },
                {
                    status: 404,
                    description: 'Person not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/avatar"
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
                        name: "Garden Gnome",
                        description: "A friendly garden gnome avatar",
                        imageUrl: "https://example.com/avatars/garden-gnome.png",
                        isDefault: false,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idAvatar: 2,
                        name: "Flower Fairy",
                        description: "A magical flower fairy avatar",
                        imageUrl: "https://example.com/avatars/flower-fairy.png",
                        isDefault: true,
                        person: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
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
                        name: "Garden Gnome",
                        description: "A friendly garden gnome avatar",
                        imageUrl: "https://example.com/avatars/garden-gnome.png",
                        isDefault: false,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
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
                description: "Updated: A friendly garden gnome with a watering can avatar",
                isDefault: true
            },
            responses: [
                {
                    status: 200,
                    description: 'Avatar updated successfully',
                    type: Avatar,
                    example: {
                        idAvatar: 1,
                        name: "Garden Gnome",
                        description: "Updated: A friendly garden gnome with a watering can avatar",
                        imageUrl: "https://example.com/avatars/garden-gnome.png",
                        isDefault: true,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                },
                {
                    status: 400,
                    description: 'Bad request - Invalid input data',
                    example: {
                        statusCode: 400,
                        message: [
                            'description must be a string',
                            'isDefault must be a boolean'
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
                        name: "Garden Gnome",
                        description: "A friendly garden gnome avatar",
                        imageUrl: "https://example.com/avatars/garden-gnome.png",
                        isDefault: false,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
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
                        name: "Garden Gnome",
                        description: "A friendly garden gnome avatar",
                        imageUrl: "https://example.com/avatars/garden-gnome.png",
                        isDefault: false,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                ]
            }],
        }),
}; 