import { CreateObjectProfileDto } from 'src/object-profile/dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from 'src/object-profile/dto/update-object-profile.dto';
import { ObjectProfile } from 'src/object-profile/entities/object-profile.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ObjectProfileDocs = {
    create: () =>
        ApiGroup({
            tag: 'Object Profiles',
            summary: 'Create a new object profile',
            description: 'Creates a new object profile for garden items.',
            bodyType: CreateObjectProfileDto,
            bodyExample: {
                name: "Watering Can Profile",
                description: "Profile for a standard 2-liter watering can",
                type: "TOOL",
                parameters: {
                    capacity: "2 liters",
                    material: "Plastic",
                    color: "Green"
                },
                idObject: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Object profile created successfully',
                    type: ObjectProfile,
                    example: {
                        idObjectProfile: 1,
                        name: "Watering Can Profile",
                        description: "Profile for a standard 2-liter watering can",
                        type: "TOOL",
                        parameters: {
                            capacity: "2 liters",
                            material: "Plastic",
                            color: "Green"
                        },
                        object: {
                            idObject: 1,
                            name: "Watering Can",
                            description: "A 2-liter watering can for indoor plants",
                            type: "TOOL",
                            isAvailable: true
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
                            'parameters must be an object',
                            'idObject must be a number'
                        ],
                        error: "Bad Request"
                    }
                },
                {
                    status: 404,
                    description: 'Object not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/object-profile"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Object Profiles',
            summary: 'Get all object profiles',
            description: 'Retrieves a list of all object profiles in the system.',
            responses: [{
                status: 200,
                description: 'List of object profiles retrieved successfully',
                type: [ObjectProfile],
                example: [
                    {
                        idObjectProfile: 1,
                        name: "Watering Can Profile",
                        description: "Profile for a standard 2-liter watering can",
                        type: "TOOL",
                        parameters: {
                            capacity: "2 liters",
                            material: "Plastic",
                            color: "Green"
                        },
                        object: {
                            idObject: 1,
                            name: "Watering Can",
                            description: "A 2-liter watering can for indoor plants",
                            type: "TOOL",
                            isAvailable: true
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idObjectProfile: 2,
                        name: "Organic Fertilizer Profile",
                        description: "Profile for organic vegetable fertilizer",
                        type: "FERTILIZER",
                        parameters: {
                            weight: "2 kg",
                            ingredients: ["Compost", "Worm castings", "Bone meal"],
                            application: "Every 2 weeks"
                        },
                        object: {
                            idObject: 2,
                            name: "Organic Fertilizer",
                            description: "Natural fertilizer for vegetables and herbs",
                            type: "FERTILIZER",
                            isAvailable: true
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Object Profiles',
            summary: 'Get an object profile by ID',
            description: 'Retrieves a specific object profile by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the object profile to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Object profile found successfully',
                    type: ObjectProfile,
                    example: {
                        idObjectProfile: 1,
                        name: "Watering Can Profile",
                        description: "Profile for a standard 2-liter watering can",
                        type: "TOOL",
                        parameters: {
                            capacity: "2 liters",
                            material: "Plastic",
                            color: "Green"
                        },
                        object: {
                            idObject: 1,
                            name: "Watering Can",
                            description: "A 2-liter watering can for indoor plants",
                            type: "TOOL",
                            isAvailable: true
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Object profile not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/object-profile/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Object Profiles',
            summary: 'Update an object profile',
            description: 'Updates the details of an existing object profile.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the object profile to update',
                example: 1
            },
            bodyType: UpdateObjectProfileDto,
            bodyExample: {
                description: "Updated: Profile for a premium 2-liter watering can with fine spray nozzle",
                parameters: {
                    capacity: "2 liters",
                    material: "Stainless Steel",
                    color: "Silver",
                    features: ["Fine spray nozzle", "Ergonomic handle"]
                }
            },
            responses: [
                {
                    status: 200,
                    description: 'Object profile updated successfully',
                    type: ObjectProfile,
                    example: {
                        idObjectProfile: 1,
                        name: "Watering Can Profile",
                        description: "Updated: Profile for a premium 2-liter watering can with fine spray nozzle",
                        type: "TOOL",
                        parameters: {
                            capacity: "2 liters",
                            material: "Stainless Steel",
                            color: "Silver",
                            features: ["Fine spray nozzle", "Ergonomic handle"]
                        },
                        object: {
                            idObject: 1,
                            name: "Watering Can",
                            description: "A 2-liter watering can for indoor plants",
                            type: "TOOL",
                            isAvailable: true
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
                            'parameters must be an object'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Object profile not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/object-profile/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Object Profiles',
            summary: 'Delete an object profile',
            description: 'Removes an object profile from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the object profile to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Object profile deleted successfully',
                    example: {
                        message: 'Object profile deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Object profile not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/object-profile/4"
                    }
                }
            ],
        }),
}; 