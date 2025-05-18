import { CreateObjectDto } from '../../object/dto/create-object.dto';
import { UpdateObjectDto } from '../../object/dto/update-object.dto';
import { ObjectEntity } from '../../object/entities/object.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ObjectDocs = {
    create: () =>
        ApiGroup({
            tag: 'Objects',
            summary: 'Create a new object',
            description: 'Creates a new object with the provided details.',
            bodyType: CreateObjectDto,
            bodyExample: {
                title: 'Garden Bench',
                description: 'Wooden garden bench',
                price: 199.99,
                isAvailable: true
            },
            responses: [
                {
                    status: 201,
                    description: 'Object created successfully',
                    type: ObjectEntity,
                    example: {
                        idObject: 1,
                        title: 'Garden Bench',
                        description: 'Wooden garden bench',
                        price: 199.99,
                        isAvailable: true,
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
                            'price must be a number',
                            'isAvailable must be a boolean'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Objects',
            summary: 'Get all objects',
            description: 'Retrieves a list of all objects in the system.',
            responses: [{
                status: 200,
                description: 'List of objects retrieved successfully',
                type: [ObjectEntity],
                example: [
                    {
                        idObject: 1,
                        title: 'Garden Bench',
                        description: 'Wooden garden bench',
                        price: 199.99,
                        isAvailable: true,
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idObject: 2,
                        title: 'Plant Stand',
                        description: 'Metal plant stand',
                        price: 89.99,
                        isAvailable: true,
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Objects',
            summary: 'Get an object by ID',
            description: 'Retrieves a specific object by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the object to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Object found successfully',
                    type: ObjectEntity,
                    example: {
                        idObject: 1,
                        title: 'Garden Bench',
                        description: 'Wooden garden bench',
                        price: 199.99,
                        isAvailable: true,
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Object not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/object/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Objects',
            summary: 'Update an object',
            description: 'Updates the details of an existing object.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the object to update',
                example: 1
            },
            bodyType: UpdateObjectDto,
            bodyExample: {
                title: 'Updated Garden Bench',
                description: 'Updated wooden garden bench',
                price: 219.99
            },
            responses: [
                {
                    status: 200,
                    description: 'Object updated successfully',
                    type: ObjectEntity,
                    example: {
                        idObject: 1,
                        title: 'Updated Garden Bench',
                        description: 'Updated wooden garden bench',
                        price: 219.99,
                        isAvailable: true,
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
                            'price must be a number'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Object not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/object/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Objects',
            summary: 'Delete an object',
            description: 'Removes an object from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the object to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Object deleted successfully',
                    example: {
                        message: 'Object deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Object not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/object/4"
                    }
                }
            ],
        }),
}; 