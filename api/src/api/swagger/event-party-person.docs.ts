import { CreateEventPartyPersonDto } from '../../event-party-person/dto/create-event-party-person.dto';
import { UpdateEventPartyPersonDto } from '../../event-party-person/dto/update-event-party-person.dto';
import { EventPartyPerson } from '../../event-party-person/entities/event-party-person.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const EventPartyPersonDocs = {
    create: () =>
        ApiGroup({
            tag: 'Event Party-Person Relationships',
            summary: 'Create a new event party-person relationship',
            description: 'Creates a new relationship between an event party and a person.',
            bodyType: CreateEventPartyPersonDto,
            bodyExample: {
                idEventParty: 1,
                idPerson: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Event Party-Person relationship created successfully',
                    type: EventPartyPerson,
                    example: {
                        idEventPartyPerson: 1,
                        idEventParty: 1,
                        idPerson: 1
                    }
                },
                {
                    status: 400,
                    description: 'Bad request',
                    example: {
                        "statusCode": 400,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/event-party-person"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Event Party-Person Relationships',
            summary: 'Get all event party-person relationships',
            description: 'Retrieves a list of all event party-person relationships in the system. Can be filtered by eventPartyId or personId.',
            responses: [{
                status: 200,
                description: 'List of event party-person relationships retrieved successfully',
                type: [EventPartyPerson],
                example: [
                    {
                        idEventPartyPerson: 1,
                        idEventParty: 1,
                        idPerson: 1
                    },
                    {
                        idEventPartyPerson: 2,
                        idEventParty: 1,
                        idPerson: 2
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Event Party-Person Relationships',
            summary: 'Get an event party-person relationship by ID',
            description: 'Retrieves a specific event party-person relationship by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the event party-person relationship to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Event Party-Person relationship found successfully',
                    type: EventPartyPerson,
                    example: {
                        idEventPartyPerson: 1,
                        idEventParty: 1,
                        idPerson: 1
                    }
                },
                {
                    status: 404,
                    description: 'Event Party-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/event-party-person/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Event Party-Person Relationships',
            summary: 'Update an event party-person relationship',
            description: 'Updates the details of an existing event party-person relationship.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the event party-person relationship to update',
                example: 1
            },
            bodyType: UpdateEventPartyPersonDto,
            bodyExample: {
                idEventParty: 2,
                idPerson: 3
            },
            responses: [
                {
                    status: 200,
                    description: 'Event Party-Person relationship updated successfully',
                    type: EventPartyPerson,
                    example: {
                        idEventPartyPerson: 1,
                        idEventParty: 2,
                        idPerson: 3
                    }
                },
                {
                    status: 404,
                    description: 'Event Party-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/event-party-person/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Event Party-Person Relationships',
            summary: 'Delete an event party-person relationship',
            description: 'Removes an event party-person relationship from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the event party-person relationship to delete',
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
                    description: 'Event Party-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/event-party-person/4"
                    }
                }
            ],
        }),
}; 