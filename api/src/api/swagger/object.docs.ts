import { CreateObjectDto } from 'src/object/dto/create-object.dto';
import { UpdateObjectDto } from 'src/object/dto/update-object.dto';
import { ObjectEntity } from 'src/object/entities/object.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ObjectDocs = {
    create: () =>
        ApiGroup({
            tag: 'Objects',
            summary: 'Create a new object',
            description: 'Creates a new object for plant care or garden management.',
            bodyType: CreateObjectDto,
            bodyExample: {
                name: "Watering Can",
                description: "A 2-liter watering can for indoor plants",
                type: "TOOL",
                isAvailable: true,
                idPerson: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Object created successfully',
                    type: ObjectEntity,
                    example: {
                        idObject: 1,
                        name: "Watering Can",
                        description: "A 2-liter watering can for indoor plants",
                        type: "TOOL",
                        isAvailable: true,
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
                            'type must be one of: TOOL, SEED, PLANT, FERTILIZER, PESTICIDE',
                            'isAvailable must be a boolean',
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
                        "path": "/api/object"
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
                        name: "Watering Can",
                        description: "A 2-liter watering can for indoor plants",
                        type: "TOOL",
                        isAvailable: true,
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
                        idObject: 2,
                        name: "Organic Fertilizer",
                        description: "Natural fertilizer for vegetables and herbs",
                        type: "FERTILIZER",
                        isAvailable: true,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findByTitle: () =>
        ApiGroup({
            tag: 'Objects',
            summary: 'Search objects by title',
            description: 'Retrieves objects that match the provided title.',
            query: {
                name: 'title',
                type: String,
                description: 'The title to search for',
                example: 'Plant Pot'
            },
            responses: [{
                status: 200,
                description: 'List of matching objects retrieved successfully',
                type: [ObjectEntity],
                example: [
                    {
                        idObject: 1,
                        name: 'Plant Pot',
                        description: 'A ceramic pot for plants',
                        type: 'TOOL',
                        isAvailable: true,
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
                        name: "Watering Can",
                        description: "A 2-liter watering can for indoor plants",
                        type: "TOOL",
                        isAvailable: true,
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
                description: "Updated: A 2-liter watering can with fine spray nozzle for indoor plants",
                isAvailable: false
            },
            responses: [
                {
                    status: 200,
                    description: 'Object updated successfully',
                    type: ObjectEntity,
                    example: {
                        idObject: 1,
                        name: "Watering Can",
                        description: "Updated: A 2-liter watering can with fine spray nozzle for indoor plants",
                        type: "TOOL",
                        isAvailable: false,
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
                            'isAvailable must be a boolean'
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