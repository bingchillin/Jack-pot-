import { CreateRelationshipDto } from '../../relationship/dto/create-relationship.dto';
import { UpdateRelationshipDto } from '../../relationship/dto/update-relationship.dto';
import { Relationship } from '../../relationship/entities/relationship.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const RelationshipDocs = {
    create: () =>
        ApiGroup({
            tag: 'Relationships',
            summary: 'Create a new relationship',
            description: 'Creates a new relationship between two persons.',
            bodyType: CreateRelationshipDto,
            bodyExample: {
                idPerson1: 1,
                idPerson2: 2,
                title: 'Friends',
                description: 'Close friends from gardening club'
            },
            responses: [
                {
                    status: 201,
                    description: 'Relationship created successfully',
                    type: Relationship,
                    example: {
                        idRelationship: 1,
                        idPerson1: 1,
                        idPerson2: 2,
                        title: 'Friends',
                        description: 'Close friends from gardening club',
                        person1: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        person2: {
                            idPerson: 2,
                            firstname: 'John',
                            surname: 'Doe'
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
                            'idPerson1 must be a number',
                            'idPerson2 must be a number'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Relationships',
            summary: 'Get all relationships',
            description: 'Retrieves a list of all relationships in the system.',
            responses: [{
                status: 200,
                description: 'List of relationships retrieved successfully',
                type: [Relationship],
                example: [
                    {
                        idRelationship: 1,
                        idPerson1: 1,
                        idPerson2: 2,
                        title: 'Friends',
                        description: 'Close friends from gardening club',
                        person1: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        person2: {
                            idPerson: 2,
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idRelationship: 2,
                        idPerson1: 1,
                        idPerson2: 3,
                        title: 'Colleagues',
                        description: 'Work together at the garden center',
                        person1: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        person2: {
                            idPerson: 3,
                            firstname: 'Alice',
                            surname: 'Johnson'
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findByTitle: () =>
        ApiGroup({
            tag: 'Relationships',
            summary: 'Search relationships by title',
            description: 'Retrieves relationships that match the provided title.',
            query: {
                name: 'title',
                type: String,
                description: 'The title to search for',
                example: 'Family'
            },
            responses: [{
                status: 200,
                description: 'List of matching relationships retrieved successfully',
                type: [Relationship],
                example: [
                    {
                        idRelationship: 1,
                        title: 'Family',
                        description: 'Family relationship type',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Relationships',
            summary: 'Get a relationship by ID',
            description: 'Retrieves a specific relationship by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the relationship to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Relationship found successfully',
                    type: Relationship,
                    example: {
                        idRelationship: 1,
                        idPerson1: 1,
                        idPerson2: 2,
                        title: 'Friends',
                        description: 'Close friends from gardening club',
                        person1: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        person2: {
                            idPerson: 2,
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/relationship/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Relationships',
            summary: 'Update a relationship',
            description: 'Updates the details of an existing relationship.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the relationship to update',
                example: 1
            },
            bodyType: UpdateRelationshipDto,
            bodyExample: {
                title: 'Updated Friends',
                description: 'Updated close friends from gardening club'
            },
            responses: [
                {
                    status: 200,
                    description: 'Relationship updated successfully',
                    type: Relationship,
                    example: {
                        idRelationship: 1,
                        idPerson1: 1,
                        idPerson2: 2,
                        title: 'Updated Friends',
                        description: 'Updated close friends from gardening club',
                        person1: {
                            idPerson: 1,
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        person2: {
                            idPerson: 2,
                            firstname: 'John',
                            surname: 'Doe'
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
                    description: 'Relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/relationship/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Relationships',
            summary: 'Delete a relationship',
            description: 'Removes a relationship from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the relationship to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Relationship deleted successfully',
                    example: {
                        message: 'Relationship deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/relationship/4"
                    }
                }
            ],
        }),
}; 