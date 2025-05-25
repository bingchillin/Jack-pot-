import { CreateParameterTypeDto } from '../../parameter-type/dto/create-parameter-type.dto';
import { UpdateParameterTypeDto } from '../../parameter-type/dto/update-parameter-type.dto';
import { ParameterType } from '../../parameter-type/entities/parameter-type.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ParameterTypeDocs = {
    create: () =>
        ApiGroup({
            tag: 'Parameter Types',
            summary: 'Create a new parameter type',
            description: 'Creates a new parameter type with the provided details.',
            bodyType: CreateParameterTypeDto,
            bodyExample: {
                title: 'Temperature',
                description: 'Temperature parameter type',
                unit: '°C'
            },
            responses: [
                {
                    status: 201,
                    description: 'Parameter type created successfully',
                    type: ParameterType,
                    example: {
                        idParameterType: 1,
                        title: 'Temperature',
                        description: 'Temperature parameter type',
                        unit: '°C',
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
                            'unit must be a string'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Parameter Types',
            summary: 'Get all parameter types',
            description: 'Retrieves a list of all parameter types in the system.',
            responses: [{
                status: 200,
                description: 'List of parameter types retrieved successfully',
                type: [ParameterType],
                example: [
                    {
                        idParameterType: 1,
                        title: 'Temperature',
                        description: 'Temperature parameter type',
                        unit: '°C',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idParameterType: 2,
                        title: 'Humidity',
                        description: 'Humidity parameter type',
                        unit: '%',
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findByTitle: () =>
        ApiGroup({
            tag: 'Parameter Types',
            summary: 'Search parameter type by title',
            description: 'Retrieves a parameter type that matches the provided title.',
            query: {
                name: 'title',
                type: String,
                description: 'The title to search for',
                example: 'Temperature'
            },
            responses: [{
                status: 200,
                description: 'Parameter type found successfully',
                type: ParameterType,
                example: {
                    idParameterType: 1,
                    title: 'Temperature',
                    description: 'Temperature parameter type',
                    unit: '°C',
                    createdAt: '2024-03-19T10:30:00.000Z',
                    updatedAt: '2024-03-19T10:30:00.000Z'
                }
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Parameter Types',
            summary: 'Get a parameter type by ID',
            description: 'Retrieves a specific parameter type by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the parameter type to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Parameter type found successfully',
                    type: ParameterType,
                    example: {
                        idParameterType: 1,
                        title: 'Temperature',
                        description: 'Temperature parameter type',
                        unit: '°C',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Parameter type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/parameter-type/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Parameter Types',
            summary: 'Update a parameter type',
            description: 'Updates the details of an existing parameter type.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the parameter type to update',
                example: 1
            },
            bodyType: UpdateParameterTypeDto,
            bodyExample: {
                title: 'Updated Temperature',
                description: 'Updated temperature parameter type',
                unit: 'K'
            },
            responses: [
                {
                    status: 200,
                    description: 'Parameter type updated successfully',
                    type: ParameterType,
                    example: {
                        idParameterType: 1,
                        title: 'Updated Temperature',
                        description: 'Updated temperature parameter type',
                        unit: 'K',
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
                            'unit must be a string'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Parameter type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/parameter-type/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Parameter Types',
            summary: 'Delete a parameter type',
            description: 'Removes a parameter type from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the parameter type to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Parameter type deleted successfully',
                    example: {
                        message: 'Parameter type deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Parameter type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/parameter-type/4"
                    }
                }
            ],
        }),
}; 