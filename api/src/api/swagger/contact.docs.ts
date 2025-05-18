import { CreateContactDto } from '../../contact/dto/create-contact.dto';
import { UpdateContactDto } from '../../contact/dto/update-contact.dto';
import { Contact } from '../../contact/entities/contact.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ContactDocs = {
    create: () =>
        ApiGroup({
            tag: 'Contacts',
            summary: 'Create a new contact',
            description: 'Creates a new contact with the provided details.',
            bodyType: CreateContactDto,
            bodyExample: {
                idPerson: 1,
                title: 'John Doe',
                description: 'Friend from gardening club',
                mail: 'john.doe@example.com',
                numberPhone: '+1234567890'
            },
            responses: [
                {
                    status: 201,
                    description: 'Contact created successfully',
                    type: Contact,
                    example: {
                        idContact: 1,
                        idPerson: 1,
                        title: 'John Doe',
                        description: 'Friend from gardening club',
                        mail: 'john.doe@example.com',
                        numberPhone: '+1234567890',
                        person: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
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
                            'mail must be an email',
                            'numberPhone must be a string',
                            'idPerson must be a number'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Contacts',
            summary: 'Get all contacts',
            description: 'Retrieves a list of all contacts in the system.',
            responses: [{
                status: 200,
                description: 'List of contacts retrieved successfully',
                type: [Contact],
                example: [
                    {
                        idContact: 1,
                        idPerson: 1,
                        title: 'John Doe',
                        description: 'Friend from gardening club',
                        mail: 'john.doe@example.com',
                        numberPhone: '+1234567890',
                        person: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idContact: 2,
                        idPerson: 1,
                        title: 'Alice Johnson',
                        description: 'Plant supplier',
                        mail: 'alice.johnson@example.com',
                        numberPhone: '+1987654321',
                        person: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Contacts',
            summary: 'Get a contact by ID',
            description: 'Retrieves a specific contact by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the contact to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Contact found successfully',
                    type: Contact,
                    example: {
                        idContact: 1,
                        idPerson: 1,
                        title: 'John Doe',
                        description: 'Friend from gardening club',
                        mail: 'john.doe@example.com',
                        numberPhone: '+1234567890',
                        person: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Contact not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/contact/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Contacts',
            summary: 'Update a contact',
            description: 'Updates the details of an existing contact.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the contact to update',
                example: 1
            },
            bodyType: UpdateContactDto,
            bodyExample: {
                title: 'Updated John Doe',
                description: 'Updated friend from gardening club',
                mail: 'john.doe.updated@example.com',
                numberPhone: '+1234567891'
            },
            responses: [
                {
                    status: 200,
                    description: 'Contact updated successfully',
                    type: Contact,
                    example: {
                        idContact: 1,
                        idPerson: 1,
                        title: 'Updated John Doe',
                        description: 'Updated friend from gardening club',
                        mail: 'john.doe.updated@example.com',
                        numberPhone: '+1234567891',
                        person: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
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
                            'description must be a string',
                            'mail must be an email',
                            'numberPhone must be a string'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Contact not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/contact/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Contacts',
            summary: 'Delete a contact',
            description: 'Removes a contact from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the contact to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Contact deleted successfully',
                    example: {
                        message: 'Contact deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Contact not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/contact/4"
                    }
                }
            ],
        }),
}; 