import { CreateEventPartyDto } from '../../event-party/dto/create-event-party.dto';
import { UpdateEventPartyDto } from '../../event-party/dto/update-event-party.dto';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const EventPartyDocs = {
    create: () =>
        ApiGroup({
            tag: 'Event Parties',
            summary: 'Create a new event party',
            description: 'Creates a new event party with the provided details.',
            bodyType: CreateEventPartyDto,
            bodyExample: {
                title: "Summer Gaming Tournament",
                description: "Join us for an exciting summer gaming tournament with amazing prizes!",
                isLaunch: false,
                beginDate: "2024-07-01",
                endDate: "2024-07-31",
                rules: "1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players"
            },
            responses: [
                {
                    status: 201,
                    description: 'Event party created successfully',
                    type: EventParty,
                    example: {
                        idEventParty: 1,
                        title: "Summer Gaming Tournament",
                        description: "Join us for an exciting summer gaming tournament with amazing prizes!",
                        isLaunch: false,
                        beginDate: "2024-07-01",
                        endDate: "2024-07-31",
                        rules: "1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players"
                    }
                },
                {
                    status: 400,
                    description: 'Bad request',
                    example: {
                        "statusCode": 400,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/event-parties"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Event Parties',
            summary: 'Get all event parties',
            description: 'Retrieves a list of all event parties in the system.',
            responses: [{
                status: 200,
                description: 'List of event parties retrieved successfully',
                type: [EventParty],
                example: [
                    {
                        idEventParty: 1,
                        title: "Summer Gaming Tournament",
                        description: "Join us for an exciting summer gaming tournament with amazing prizes!",
                        isLaunch: false,
                        beginDate: "2024-07-01",
                        endDate: "2024-07-31",
                        rules: "1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players"
                    },
                    {
                        idEventParty: 2,
                        title: "Winter Coding Challenge",
                        description: "A month-long coding challenge for developers of all levels",
                        isLaunch: true,
                        beginDate: "2024-12-01",
                        endDate: "2024-12-31",
                        rules: "1. Teams of 2-4 members\n2. All code must be original\n3. Daily challenges and weekly prizes"
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Event Parties',
            summary: 'Get an event party by ID',
            description: 'Retrieves a specific event party by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the event party to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Event party found successfully',
                    type: EventParty,
                    example: {
                        idEventParty: 1,
                        title: "Summer Gaming Tournament",
                        description: "Join us for an exciting summer gaming tournament with amazing prizes!",
                        isLaunch: false,
                        beginDate: "2024-07-01",
                        endDate: "2024-07-31",
                        rules: "1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players"
                    }
                },
                {
                    status: 404,
                    description: 'Event party not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/event-parties/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Event Parties',
            summary: 'Update an event party',
            description: 'Updates the details of an existing event party.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the event party to update',
                example: 1
            },
            bodyType: UpdateEventPartyDto,
            bodyExample: {
                title: "Summer Gaming Tournament 2024",
                isLaunch: true,
                rules: "1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players\n4. New rule: Teams must have at least 3 members"
            },
            responses: [
                {
                    status: 200,
                    description: 'Event party updated successfully',
                    type: EventParty,
                    example: {
                        idEventParty: 1,
                        title: "Summer Gaming Tournament 2024",
                        description: "Join us for an exciting summer gaming tournament with amazing prizes!",
                        isLaunch: true,
                        beginDate: "2024-07-01",
                        endDate: "2024-07-31",
                        rules: "1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players\n4. New rule: Teams must have at least 3 members"
                    }
                },
                {
                    status: 404,
                    description: 'Event party not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/event-parties/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Event Parties',
            summary: 'Delete an event party',
            description: 'Removes an event party from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the event party to delete',
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
                    description: 'Event party not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/event-parties/4"
                    }
                }
            ],
        }),
}; 