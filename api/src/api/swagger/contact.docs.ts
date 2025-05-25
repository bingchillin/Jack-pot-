import { CreateContactDto } from 'src/contact/dto/create-contact.dto';
import { UpdateContactDto } from 'src/contact/dto/update-contact.dto';
import { Contact } from 'src/contact/entities/contact.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const ContactDocs = {
    create: () =>
        ApiGroup({
            tag: 'Contacts',
            summary: 'Create a new contact',
            description: 'Creates a new contact for a person with the provided details.',
            bodyType: CreateContactDto,
            bodyExample: {
                relation: "Friend",
                description: "Close friend from gardening club",
                isActive: true,
                valueReturn: "Accepted",
                idPerson: 1,
                idRelationship: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Contact created successfully',
                    type: Contact,
                    example: {
                        idContact: 1,
                        relation: "Friend",
                        description: "Close friend from gardening club",
                        isActive: true,
                        valueReturn: "Accepted",
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        relationship: {
                            idRelationship: 1,
                            title: 'Friend',
                            description: 'Friend relationship type'
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
                            'relation must be a string',
                            'description must be a string',
                            'isActive must be a boolean',
                            'valueReturn must be a string',
                            'idPerson must be a number',
                            'idRelationship must be a number'
                        ],
                        error: "Bad Request"
                    }
                },
                {
                    status: 404,
                    description: 'Person or relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/contact"
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
                        relation: "Friend",
                        description: "Close friend from gardening club",
                        isActive: true,
                        valueReturn: "Accepted",
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        relationship: {
                            idRelationship: 1,
                            title: 'Friend',
                            description: 'Friend relationship type'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idContact: 2,
                        relation: "Family",
                        description: "Family member",
                        isActive: true,
                        valueReturn: "Pending",
                        person: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        relationship: {
                            idRelationship: 2,
                            title: 'Family',
                            description: 'Family relationship type'
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
                        relation: "Friend",
                        description: "Close friend from gardening club",
                        isActive: true,
                        valueReturn: "Accepted",
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        relationship: {
                            idRelationship: 1,
                            title: 'Friend',
                            description: 'Friend relationship type'
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
                relation: "Close Friend",
                description: "Updated close friend from gardening club",
                isActive: true,
                valueReturn: "Accepted"
            },
            responses: [
                {
                    status: 200,
                    description: 'Contact updated successfully',
                    type: Contact,
                    example: {
                        idContact: 1,
                        relation: "Close Friend",
                        description: "Updated close friend from gardening club",
                        isActive: true,
                        valueReturn: "Accepted",
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        relationship: {
                            idRelationship: 1,
                            title: 'Friend',
                            description: 'Friend relationship type'
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
                            'relation must be a string',
                            'description must be a string',
                            'isActive must be a boolean',
                            'valueReturn must be a string'
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