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
                mail: "john.doe@example.com",
                firstname: "John",
                surname: "Doe",
                password: "securePassword123",
                numberPhone: "+33612345678",
                idRole: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Person created successfully',
                    type: Person,
                    example: {
                        "mail": "test@test.com",
                        "firstname": "Test",
                        "surname": "User",
                        "numberPhone": "123456789",
                        "idRole": 1,
                        "idPerson": 2
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
                        mail: "john.doe@example.com",
                        firstname: "John",
                        surname: "Doe",
                        numberPhone: "+33612345678",
                        idRole: 1
                    },
                    {
                        idPerson: 2,
                        mail: "jane.smith@example.com",
                        firstname: "Jane",
                        surname: "Smith",
                        numberPhone: "+33687654321",
                        idRole: 2
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
                        mail: "john.doe@example.com",
                        firstname: "John",
                        surname: "Doe",
                        password: "securePassword123",
                        numberPhone: "+33612345678",
                        idRole: 1
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
                        mail: "john.doe@example.com",
                        firstname: "Johnny",
                        surname: "Doe",
                        numberPhone: "+33612345678",
                        idRole: 2
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
                    description: '',
                    example: {
                        message: ""
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
