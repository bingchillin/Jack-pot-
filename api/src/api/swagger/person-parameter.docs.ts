import { CreatePersonParameterDto } from '../../lnk-person-parameter/dto/create-person-parameter.dto';
import { UpdatePersonParameterDto } from '../../lnk-person-parameter/dto/update-person-parameter.dto';
import { PersonParameter } from '../../lnk-person-parameter/entities/person-parameter.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const PersonParameterDocs = {
    create: () =>
        ApiGroup({
            tag: 'Person Parameters',
            summary: 'Create a new person parameter',
            description: 'Creates a new parameter for a person.',
            bodyType: CreatePersonParameterDto,
            bodyExample: {
                idPerson: 1,
                idParameterType: 1,
                value: 42.5
            },
            responses: [
                {
                    status: 201,
                    description: 'Person parameter created successfully',
                    type: PersonParameter,
                    example: {
                        idPersonParameter: 1,
                        idPerson: 1,
                        idParameterType: 1,
                        value: 42.5,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        parameterType: {
                            idParameterType: 1,
                            title: 'Height',
                            description: 'Person height in centimeters'
                        }
                    }
                },
                {
                    status: 400,
                    description: 'Bad request - Invalid input data',
                    example: {
                        statusCode: 400,
                        message: [
                            'value must be a number',
                            'idPerson must be a number',
                            'idParameterType must be a number'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Person Parameters',
            summary: 'Get all person parameters',
            description: 'Retrieves a list of all person parameters in the system. Can be filtered by personId or parameterTypeId.',
            responses: [{
                status: 200,
                description: 'List of person parameters retrieved successfully',
                type: [PersonParameter],
                example: [
                    {
                        idPersonParameter: 1,
                        idPerson: 1,
                        idParameterType: 1,
                        value: 42.5,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        parameterType: {
                            idParameterType: 1,
                            title: 'Height',
                            description: 'Person height in centimeters'
                        }
                    },
                    {
                        idPersonParameter: 2,
                        idPerson: 1,
                        idParameterType: 2,
                        value: 75.2,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        parameterType: {
                            idParameterType: 2,
                            title: 'Weight',
                            description: 'Person weight in kilograms'
                        }
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Person Parameters',
            summary: 'Get a person parameter by ID',
            description: 'Retrieves a specific person parameter by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the person parameter to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Person parameter found successfully',
                    type: PersonParameter,
                    example: {
                        idPersonParameter: 1,
                        idPerson: 1,
                        idParameterType: 1,
                        value: 42.5,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        parameterType: {
                            idParameterType: 1,
                            title: 'Height',
                            description: 'Person height in centimeters'
                        }
                    }
                },
                {
                    status: 404,
                    description: 'Person parameter not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/person-parameter/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Person Parameters',
            summary: 'Update a person parameter',
            description: 'Updates the details of an existing person parameter.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the person parameter to update',
                example: 1
            },
            bodyType: UpdatePersonParameterDto,
            bodyExample: {
                value: 43.0
            },
            responses: [
                {
                    status: 200,
                    description: 'Person parameter updated successfully',
                    type: PersonParameter,
                    example: {
                        idPersonParameter: 1,
                        idPerson: 1,
                        idParameterType: 1,
                        value: 43.0,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        parameterType: {
                            idParameterType: 1,
                            title: 'Height',
                            description: 'Person height in centimeters'
                        }
                    }
                },
                {
                    status: 400,
                    description: 'Bad request - Invalid input data',
                    example: {
                        statusCode: 400,
                        message: [
                            'value must be a number'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Person parameter not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/person-parameter/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Person Parameters',
            summary: 'Delete a person parameter',
            description: 'Removes a person parameter from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the person parameter to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Person parameter deleted successfully',
                    example: {
                        message: 'Person parameter deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Person parameter not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/person-parameter/4"
                    }
                }
            ],
        }),
}; 