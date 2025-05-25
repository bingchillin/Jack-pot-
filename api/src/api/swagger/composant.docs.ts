import { CreateComposantDto } from 'src/composant/dto/create-composant.dto';
import { UpdateComposantDto } from 'src/composant/dto/update-composant.dto';
import { Composant } from 'src/composant/entities/composant.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ComposantDocs = {
    create: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Create a new composant',
            description: 'Creates a new composant for garden or plant management.',
            bodyType: CreateComposantDto,
            bodyExample: {
                name: "Soil Mix",
                description: "A balanced mix of potting soil, perlite, and compost",
                type: "SOIL",
                quantity: 5,
                unit: "kg",
                isAvailable: true
            },
            responses: [
                {
                    status: 201,
                    description: 'Composant created successfully',
                    type: Composant,
                    example: {
                        idComposant: 1,
                        name: "Soil Mix",
                        description: "A balanced mix of potting soil, perlite, and compost",
                        type: "SOIL",
                        quantity: 5,
                        unit: "kg",
                        isAvailable: true,
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
                            'type must be one of: SOIL, FERTILIZER, PESTICIDE, TOOL, SEED',
                            'quantity must be a number',
                            'unit must be a string',
                            'isAvailable must be a boolean'
                        ],
                        error: "Bad Request"
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
                        name: "Soil Mix",
                        description: "A balanced mix of potting soil, perlite, and compost",
                        type: "SOIL",
                        quantity: 5,
                        unit: "kg",
                        isAvailable: true,
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idComposant: 2,
                        name: "Organic Fertilizer",
                        description: "Natural fertilizer for vegetables and herbs",
                        type: "FERTILIZER",
                        quantity: 2,
                        unit: "kg",
                        isAvailable: true,
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findByTitle: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Search composants by title',
            description: 'Retrieves composants that match the provided title.',
            query: {
                name: 'title',
                type: String,
                description: 'The title to search for',
                example: 'Soil Mix'
            },
            responses: [{
                status: 200,
                description: 'List of matching composants retrieved successfully',
                type: [Composant],
                example: [
                    {
                        idComposant: 1,
                        name: "Soil Mix",
                        description: "A balanced mix of potting soil, perlite, and compost",
                        type: "SOIL",
                        quantity: 5,
                        unit: "kg",
                        isAvailable: true,
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                ]
            }],
        }),

    findByObject: () =>
        ApiGroup({
            tag: 'Composants',
            summary: 'Get composants by object',
            description: 'Retrieves composants associated with a specific object.',
            query: {
                name: 'objectId',
                type: Number,
                description: 'The ID of the object',
                example: 1
            },
            responses: [{
                status: 200,
                description: 'List of composants for the object retrieved successfully',
                type: [Composant],
                example: [
                    {
                        idComposant: 1,
                        name: "Soil Mix",
                        description: "A balanced mix of potting soil, perlite, and compost",
                        type: "SOIL",
                        quantity: 5,
                        unit: "kg",
                        isAvailable: true,
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idComposant: 2,
                        name: "Organic Fertilizer",
                        description: "Natural fertilizer for vegetables and herbs",
                        type: "FERTILIZER",
                        quantity: 2,
                        unit: "kg",
                        isAvailable: true,
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
                        name: "Soil Mix",
                        description: "A balanced mix of potting soil, perlite, and compost",
                        type: "SOIL",
                        quantity: 5,
                        unit: "kg",
                        isAvailable: true,
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
                description: "Updated: A premium balanced mix of potting soil, perlite, and organic compost",
                quantity: 3,
                isAvailable: false
            },
            responses: [
                {
                    status: 200,
                    description: 'Composant updated successfully',
                    type: Composant,
                    example: {
                        idComposant: 1,
                        name: "Soil Mix",
                        description: "Updated: A premium balanced mix of potting soil, perlite, and organic compost",
                        type: "SOIL",
                        quantity: 3,
                        unit: "kg",
                        isAvailable: false,
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
                            'quantity must be a number',
                            'isAvailable must be a boolean'
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