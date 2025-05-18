import { CreatePlantTypeDto } from '../../plant-type/dto/create-plant-type.dto';
import { UpdatePlantTypeDto } from '../../plant-type/dto/update-plant-type.dto';
import { PlantType } from '../../plant-type/entities/plant-type.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const PlantTypeDocs = {
    create: () =>
        ApiGroup({
            tag: 'Plant Types',
            summary: 'Create a new plant type',
            description: 'Creates a new plant type with the provided details.',
            bodyType: CreatePlantTypeDto,
            bodyExample: {
                title: 'Flower',
                description: 'Decorative flowering plants',
                advise: 'Water daily and keep in indirect sunlight'
            },
            responses: [
                {
                    status: 201,
                    description: 'Plant type created successfully',
                    type: PlantType,
                    example: {
                        idPlantType: 1,
                        title: 'Flower',
                        description: 'Decorative flowering plants',
                        advise: 'Water daily and keep in indirect sunlight',
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
                            'advise must be a string'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Plant Types',
            summary: 'Get all plant types',
            description: 'Retrieves a list of all plant types in the system.',
            responses: [{
                status: 200,
                description: 'List of plant types retrieved successfully',
                type: [PlantType],
                example: [
                    {
                        idPlantType: 1,
                        title: 'Flower',
                        description: 'Decorative flowering plants',
                        advise: 'Water daily and keep in indirect sunlight',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idPlantType: 2,
                        title: 'Succulent',
                        description: 'Drought-resistant plants',
                        advise: 'Water sparingly and provide plenty of sunlight',
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Plant Types',
            summary: 'Get a plant type by ID',
            description: 'Retrieves a specific plant type by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant type to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant type found successfully',
                    type: PlantType,
                    example: {
                        idPlantType: 1,
                        title: 'Flower',
                        description: 'Decorative flowering plants',
                        advise: 'Water daily and keep in indirect sunlight',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Plant type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant-type/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Plant Types',
            summary: 'Update a plant type',
            description: 'Updates the details of an existing plant type.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant type to update',
                example: 1
            },
            bodyType: UpdatePlantTypeDto,
            bodyExample: {
                title: 'Updated Flower',
                description: 'Updated decorative flowering plants'
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant type updated successfully',
                    type: PlantType,
                    example: {
                        idPlantType: 1,
                        title: 'Updated Flower',
                        description: 'Updated decorative flowering plants',
                        advise: 'Water daily and keep in indirect sunlight',
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
                    description: 'Plant type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant-type/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Plant Types',
            summary: 'Delete a plant type',
            description: 'Removes a plant type from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant type to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant type deleted successfully',
                    example: {
                        message: 'Plant type deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Plant type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant-type/4"
                    }
                }
            ],
        }),
}; 