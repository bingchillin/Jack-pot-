import { CreateObjectProfileDto } from '../../object-profile/dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from '../../object-profile/dto/update-object-profile.dto';
import { ObjectProfile } from '../../object-profile/entities/object-profile.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ObjectProfileDocs = {
    create: () =>
        ApiGroup({
            tag: 'Object Profiles',
            summary: 'Create a new object profile',
            description: 'Creates a new object profile with the provided details.',
            bodyType: CreateObjectProfileDto,
            bodyExample: {
                idObject: 1,
                idPlantType: 1,
                title: 'Garden Profile',
                description: 'Profile for garden objects',
                advise: 'Place in a sunny location'
            },
            responses: [
                {
                    status: 201,
                    description: 'Object profile created successfully',
                    type: ObjectProfile,
                    example: {
                        idObjectProfile: 1,
                        idObject: 1,
                        idPlantType: 1,
                        title: 'Garden Profile',
                        description: 'Profile for garden objects',
                        advise: 'Place in a sunny location',
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
                        plantType: {
                            idPlantType: 1,
                            title: 'Flower',
                            description: 'Decorative flowering plants'
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
                            'advise must be a string',
                            'idObject must be a number',
                            'idPlantType must be a number'
                        ],
                        error: 'Bad Request'
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
                        idObject: 1,
                        idPlantType: 1,
                        title: 'Garden Profile',
                        description: 'Profile for garden objects',
                        advise: 'Place in a sunny location',
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
                        plantType: {
                            idPlantType: 1,
                            title: 'Flower',
                            description: 'Decorative flowering plants'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idObjectProfile: 2,
                        idObject: 2,
                        idPlantType: 2,
                        title: 'Indoor Profile',
                        description: 'Profile for indoor objects',
                        advise: 'Keep away from direct sunlight',
                        object: {
                            idObject: 2,
                            title: 'Plant Stand',
                            description: 'Metal plant stand'
                        },
                        plantType: {
                            idPlantType: 2,
                            title: 'Succulent',
                            description: 'Drought-resistant plants'
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
                        idObject: 1,
                        idPlantType: 1,
                        title: 'Garden Profile',
                        description: 'Profile for garden objects',
                        advise: 'Place in a sunny location',
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
                        plantType: {
                            idPlantType: 1,
                            title: 'Flower',
                            description: 'Decorative flowering plants'
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
                title: 'Updated Garden Profile',
                description: 'Updated profile for garden objects'
            },
            responses: [
                {
                    status: 200,
                    description: 'Object profile updated successfully',
                    type: ObjectProfile,
                    example: {
                        idObjectProfile: 1,
                        idObject: 1,
                        idPlantType: 1,
                        title: 'Updated Garden Profile',
                        description: 'Updated profile for garden objects',
                        advise: 'Place in a sunny location',
                        object: {
                            idObject: 1,
                            title: 'Garden Bench',
                            description: 'Wooden garden bench'
                        },
                        plantType: {
                            idPlantType: 1,
                            title: 'Flower',
                            description: 'Decorative flowering plants'
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
                            'description must be a string'
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