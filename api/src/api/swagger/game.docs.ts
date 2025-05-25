import { CreateGameDto } from 'src/game/dto/create-game.dto';
import { UpdateGameDto } from 'src/game/dto/update-game.dto';
import { Game } from 'src/game/entities/game.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const GameDocs = {
    create: () =>
        ApiGroup({
            tag: 'Games',
            summary: 'Create a new game',
            description: 'Creates a new game with the provided details.',
            bodyType: CreateGameDto,
            bodyExample: {
                title: "Plant Quiz",
                description: "Test your knowledge about plants",
                beginDate: "2024-03-20",
                endDate: "2024-03-25",
                rules: "Answer 10 questions about plants. Highest score wins!",
                idEventParty: 1,
                idWon: 1,
                idLose: 2
            },
            responses: [
                {
                    status: 201,
                    description: 'Game created successfully',
                    type: Game,
                    example: {
                        idGame: 1,
                        title: "Plant Quiz",
                        description: "Test your knowledge about plants",
                        beginDate: "2024-03-20",
                        endDate: "2024-03-25",
                        rules: "Answer 10 questions about plants. Highest score wins!",
                        eventParty: {
                            idEventParty: 1,
                            title: "Spring Garden Party",
                            description: "Annual spring garden gathering"
                        },
                        winner: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        loser: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        players: [],
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
                            'title must be a string',
                            'description must be a string',
                            'beginDate must be a valid date',
                            'endDate must be a valid date',
                            'rules must be a string',
                            'idEventParty must be a number',
                            'idWon must be a number',
                            'idLose must be a number'
                        ],
                        error: "Bad Request"
                    }
                },
                {
                    status: 404,
                    description: 'Event party or person not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/game"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Games',
            summary: 'Get all games',
            description: 'Retrieves a list of all games in the system.',
            responses: [{
                status: 200,
                description: 'List of games retrieved successfully',
                type: [Game],
                example: [
                    {
                        idGame: 1,
                        title: "Plant Quiz",
                        description: "Test your knowledge about plants",
                        beginDate: "2024-03-20",
                        endDate: "2024-03-25",
                        rules: "Answer 10 questions about plants. Highest score wins!",
                        eventParty: {
                            idEventParty: 1,
                            title: "Spring Garden Party",
                            description: "Annual spring garden gathering"
                        },
                        winner: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        loser: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        players: [],
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idGame: 2,
                        title: "Garden Scavenger Hunt",
                        description: "Find hidden items in the garden",
                        beginDate: "2024-03-21",
                        endDate: "2024-03-21",
                        rules: "Find all 10 hidden items. Fastest time wins!",
                        eventParty: {
                            idEventParty: 1,
                            title: "Spring Garden Party",
                            description: "Annual spring garden gathering"
                        },
                        winner: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        loser: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        players: [],
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Games',
            summary: 'Get a game by ID',
            description: 'Retrieves a specific game by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the game to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Game found successfully',
                    type: Game,
                    example: {
                        idGame: 1,
                        title: "Plant Quiz",
                        description: "Test your knowledge about plants",
                        beginDate: "2024-03-20",
                        endDate: "2024-03-25",
                        rules: "Answer 10 questions about plants. Highest score wins!",
                        eventParty: {
                            idEventParty: 1,
                            title: "Spring Garden Party",
                            description: "Annual spring garden gathering"
                        },
                        winner: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        loser: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        players: [],
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Game not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/game/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Games',
            summary: 'Update a game',
            description: 'Updates the details of an existing game.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the game to update',
                example: 1
            },
            bodyType: UpdateGameDto,
            bodyExample: {
                title: "Updated Plant Quiz",
                description: "Updated test your knowledge about plants",
                beginDate: "2024-03-21",
                endDate: "2024-03-26",
                rules: "Updated: Answer 15 questions about plants. Highest score wins!"
            },
            responses: [
                {
                    status: 200,
                    description: 'Game updated successfully',
                    type: Game,
                    example: {
                        idGame: 1,
                        title: "Updated Plant Quiz",
                        description: "Updated test your knowledge about plants",
                        beginDate: "2024-03-21",
                        endDate: "2024-03-26",
                        rules: "Updated: Answer 15 questions about plants. Highest score wins!",
                        eventParty: {
                            idEventParty: 1,
                            title: "Spring Garden Party",
                            description: "Annual spring garden gathering"
                        },
                        winner: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        loser: {
                            idPerson: 2,
                            email: 'jane.smith@example.com',
                            firstname: 'Jane',
                            surname: 'Smith'
                        },
                        players: [],
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
                            'beginDate must be a valid date',
                            'endDate must be a valid date',
                            'rules must be a string'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Game not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/game/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Games',
            summary: 'Delete a game',
            description: 'Removes a game from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the game to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Game deleted successfully',
                    example: {
                        message: 'Game deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Game not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/game/4"
                    }
                }
            ],
        }),
}; 