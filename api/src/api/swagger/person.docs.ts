import { CreatePersonDto } from 'src/person/dto/create-person.dto';
import { UpdatePersonDto } from 'src/person/dto/update-person.dto';
import { Person } from 'src/person/entities/person.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const PersonDocs = {
    create: () =>
        ApiGroup({
            tag: 'Persons',
            summary: 'Create a new person',
            description: 'Creates a new person with the provided details. The email must be unique.',
            bodyType: CreatePersonDto,
            bodyExample: {
                email: "john.doe@example.com",
                firstname: "John",
                surname: "Doe",
                password: "securePassword123",
                numberPhone: "+33612345678",
                idRole: 2
            },
            responses: [
                {
                    status: 201,
                    description: 'Person created successfully',
                    type: Person,
                    example: {
                        idPerson: 1,
                        email: 'john.doe@example.com',
                        firstname: 'John',
                        surname: 'Doe',
                        numberPhone: '+33612345678',
                        role: {
                            idRole: 1,
                            title: 'Admin',
                            description: 'Administrator role'
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
                            'email must be an email',
                            'firstname must be a string',
                            'surname must be a string',
                            'password must be longer than or equal to 6 characters'
                        ],
                        error: "Bad Request"
                    }
                },
                {
                    status: 409,
                    description: 'Conflict',
                    example: {
                        "statusCode": 409,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/person/"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Persons',
            summary: 'Get all persons',
            description: 'Retrieves a list of all persons in the system.',
            responses: [{
                status: 200,
                description: 'List of persons retrieved successfully',
                type: [Person],
                example: [
                    {
                        idPerson: 1,
                        email: 'john.doe@example.com',
                        firstname: 'John',
                        surname: 'Doe',
                        numberPhone: '+33612345678',
                        role: {
                            idRole: 1,
                            title: 'Admin',
                            description: 'Administrator role'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idPerson: 2,
                        email: 'jane.smith@example.com',
                        firstname: 'Jane',
                        surname: 'Smith',
                        numberPhone: '+33698765432',
                        role: {
                            idRole: 2,
                            title: 'User',
                            description: 'Regular user role'
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Persons',
            summary: 'Get a person by ID',
            description: 'Retrieves a specific person by their ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the person to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Person found successfully',
                    type: Person,
                    example: {
                        idPerson: 1,
                        email: 'john.doe@example.com',
                        firstname: 'John',
                        surname: 'Doe',
                        numberPhone: '+33612345678',
                        role: {
                            idRole: 1,
                            title: 'Admin',
                            description: 'Administrator role'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Person not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/person/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Persons',
            summary: 'Update a person',
            description: 'Updates the details of an existing person.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the person to update',
                example: 1
            },
            bodyType: UpdatePersonDto,
            bodyExample: {
                firstname: "Johnny",
                surname: "Doe",
                numberPhone: "+33612345678",
                idRole: 2
            },
            responses: [
                {
                    status: 200,
                    description: 'Person updated successfully',
                    type: Person,
                    example: {
                        idPerson: 1,
                        email: 'john.doe@example.com',
                        firstname: 'Johnny',
                        surname: 'Doe',
                        numberPhone: '+33612345679',
                        role: {
                            idRole: 2,
                            title: 'User',
                            description: 'Regular user role'
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
                            'numberPhone must be a valid phone number'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Person not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/person/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Persons',
            summary: 'Delete a person',
            description: 'Removes a person from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the person to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Person deleted successfully',
                    example: {
                        message: 'Person deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Person not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/person/4"
                    }
                }
            ],
        }),
};
