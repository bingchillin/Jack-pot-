import { CreatePlantDto } from 'src/plant/dto/create-plant.dto';
import { UpdatePlantDto } from 'src/plant/dto/update-plant.dto';
import { Plant } from 'src/plant/entities/plant.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const PlantDocs = {
    create: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Create a new plant',
            description: 'Creates a new plant with the provided details.',
            bodyType: CreatePlantDto,
            bodyExample: {
                name: "Rose Bush",
                description: "Beautiful red rose bush",
                price: 29.99,
                category: "Flowers",
                isAvailable: true,
                idPerson: 1,
                idObject: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Plant created successfully',
                    type: Plant,
                    example: {
                        idPlant: 1,
                        name: "Rose Bush",
                        description: "Beautiful red rose bush",
                        price: 29.99,
                        category: "Flowers",
                        isAvailable: true,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        object: {
                            idObject: 1,
                            title: 'Garden Plot 1',
                            description: 'Main garden plot'
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
                            'price must be a number',
                            'category must be a string',
                            'isAvailable must be a boolean',
                            'idPerson must be a number',
                            'idObject must be a number'
                        ],
                        error: "Bad Request"
                    }
                },
                {
                    status: 404,
                    description: 'Person or object not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Get all plants',
            description: 'Retrieves a list of all plants in the system.',
            responses: [{
                status: 200,
                description: 'List of plants retrieved successfully',
                type: [Plant],
                example: [
                    {
                        idPlant: 1,
                        name: "Rose Bush",
                        description: "Beautiful red rose bush",
                        price: 29.99,
                        category: "Flowers",
                        isAvailable: true,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        object: {
                            idObject: 1,
                            title: 'Garden Plot 1',
                            description: 'Main garden plot'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idPlant: 2,
                        name: "Tomato Plant",
                        description: "Organic tomato plant",
                        price: 15.99,
                        category: "Vegetables",
                        isAvailable: true,
                        person: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        object: {
                            idObject: 2,
                            title: 'Garden Plot 2',
                            description: 'Secondary garden plot'
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Get a plant by ID',
            description: 'Retrieves a specific plant by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant found successfully',
                    type: Plant,
                    example: {
                        idPlant: 1,
                        name: "Rose Bush",
                        description: "Beautiful red rose bush",
                        price: 29.99,
                        category: "Flowers",
                        isAvailable: true,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        object: {
                            idObject: 1,
                            title: 'Garden Plot 1',
                            description: 'Main garden plot'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Plant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Update a plant',
            description: 'Updates the details of an existing plant.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant to update',
                example: 1
            },
            bodyType: UpdatePlantDto,
            bodyExample: {
                name: "Updated Rose Bush",
                description: "Updated beautiful red rose bush",
                price: 34.99,
                category: "Premium Flowers",
                isAvailable: true
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant updated successfully',
                    type: Plant,
                    example: {
                        idPlant: 1,
                        name: "Updated Rose Bush",
                        description: "Updated beautiful red rose bush",
                        price: 34.99,
                        category: "Premium Flowers",
                        isAvailable: true,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        object: {
                            idObject: 1,
                            title: 'Garden Plot 1',
                            description: 'Main garden plot'
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
                            'name must be a string',
                            'description must be a string',
                            'price must be a number',
                            'category must be a string',
                            'isAvailable must be a boolean'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Plant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Delete a plant',
            description: 'Removes a plant from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant deleted successfully',
                    example: {
                        message: 'Plant deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Plant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant/4"
                    }
                }
            ],
        }),
}; 