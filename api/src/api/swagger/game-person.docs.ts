import { CreateGamePersonDto } from '../../game-person/dto/create-game-person.dto';
import { UpdateGamePersonDto } from '../../game-person/dto/update-game-person.dto';
import { GamePerson } from '../../game-person/entities/game-person.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const GamePersonDocs = {
    create: () =>
        ApiGroup({
            tag: 'Game-Person Relationships',
            summary: 'Create a new game-person relationship',
            description: 'Creates a new relationship between a game and a person.',
            bodyType: CreateGamePersonDto,
            bodyExample: {
                idGame: 1,
                idPerson: 1,
                isOwner: true,
                isPlayer: false
            },
            responses: [
                {
                    status: 201,
                    description: 'Game-Person relationship created successfully',
                    type: GamePerson,
                    example: {
                        idGamePerson: 1,
                        idGame: 1,
                        idPerson: 1,
                        isOwner: true,
                        isPlayer: false
                    }
                },
                {
                    status: 400,
                    description: 'Bad request',
                    example: {
                        "statusCode": 400,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/game-person"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Game-Person Relationships',
            summary: 'Get all game-person relationships',
            description: 'Retrieves a list of all game-person relationships in the system. Can be filtered by gameId or personId.',
            responses: [{
                status: 200,
                description: 'List of game-person relationships retrieved successfully',
                type: [GamePerson],
                example: [
                    {
                        idGamePerson: 1,
                        idGame: 1,
                        idPerson: 1,
                        isOwner: true,
                        isPlayer: false
                    },
                    {
                        idGamePerson: 2,
                        idGame: 1,
                        idPerson: 2,
                        isOwner: false,
                        isPlayer: true
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Game-Person Relationships',
            summary: 'Get a game-person relationship by ID',
            description: 'Retrieves a specific game-person relationship by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the game-person relationship to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Game-Person relationship found successfully',
                    type: GamePerson,
                    example: {
                        idGamePerson: 1,
                        idGame: 1,
                        idPerson: 1,
                        isOwner: true,
                        isPlayer: false
                    }
                },
                {
                    status: 404,
                    description: 'Game-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/game-person/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Game-Person Relationships',
            summary: 'Update a game-person relationship',
            description: 'Updates the details of an existing game-person relationship.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the game-person relationship to update',
                example: 1
            },
            bodyType: UpdateGamePersonDto,
            bodyExample: {
                isOwner: false,
                isPlayer: true
            },
            responses: [
                {
                    status: 200,
                    description: 'Game-Person relationship updated successfully',
                    type: GamePerson,
                    example: {
                        idGamePerson: 1,
                        idGame: 1,
                        idPerson: 1,
                        isOwner: false,
                        isPlayer: true
                    }
                },
                {
                    status: 404,
                    description: 'Game-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/game-person/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Game-Person Relationships',
            summary: 'Delete a game-person relationship',
            description: 'Removes a game-person relationship from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the game-person relationship to delete',
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
                    description: 'Game-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/game-person/4"
                    }
                }
            ],
        }),
}; 