import { CreateComposantDto } from '../../composant/dto/create-composant.dto';
import { UpdateComposantDto } from '../../composant/dto/update-composant.dto';
import { Composant } from '../../composant/entities/composant.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ComposantDocs = {
    create: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Create a new composant',
            description: 'Creates a new composant with the provided details.',
            bodyType: CreateComposantDto,
            bodyExample: {
                idObject: 1,
                title: 'Wooden Leg',
                description: 'Leg for garden bench',
                quantity: 4,
                price: 15.99
            },
            responses: [
                {
                    status: 201,
                    description: 'Composant created successfully',
                    type: Composant,
                    example: {
                        idComposant: 1,
                        idObject: 1,
                        title: 'Wooden Leg',
                        description: 'Leg for garden bench',
                        quantity: 4,
                        price: 15.99,
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
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
                            'quantity must be a number',
                            'price must be a number',
                            'idObject must be a number'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Get all composants',
            description: 'Retrieves a list of all composants in the system.',
            responses: [{
                status: 200,
                description: 'List of composants retrieved successfully',
                type: [Composant],
                example: [
                    {
                        idComposant: 1,
                        idObject: 1,
                        title: 'Wooden Leg',
                        description: 'Leg for garden bench',
                        quantity: 4,
                        price: 15.99,
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idComposant: 2,
                        idObject: 1,
                        title: 'Wooden Seat',
                        description: 'Seat for garden bench',
                        quantity: 1,
                        price: 45.99,
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Get a composant by ID',
            description: 'Retrieves a specific composant by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the composant to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Composant found successfully',
                    type: Composant,
                    example: {
                        idComposant: 1,
                        idObject: 1,
                        title: 'Wooden Leg',
                        description: 'Leg for garden bench',
                        quantity: 4,
                        price: 15.99,
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Composant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/composant/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Update a composant',
            description: 'Updates the details of an existing composant.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the composant to update',
                example: 1
            },
            bodyType: UpdateComposantDto,
            bodyExample: {
                title: 'Updated Wooden Leg',
                description: 'Updated leg for garden bench',
                quantity: 6,
                price: 17.99
            },
            responses: [
                {
                    status: 200,
                    description: 'Composant updated successfully',
                    type: Composant,
                    example: {
                        idComposant: 1,
                        idObject: 1,
                        title: 'Updated Wooden Leg',
                        description: 'Updated leg for garden bench',
                        quantity: 6,
                        price: 17.99,
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
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
                            'description must be a string',
                            'quantity must be a number',
                            'price must be a number'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Composant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/composant/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Delete a composant',
            description: 'Removes a composant from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the composant to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Composant deleted successfully',
                    example: {
                        message: 'Composant deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Composant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/composant/4"
                    }
                }
            ],
        }),
}; 