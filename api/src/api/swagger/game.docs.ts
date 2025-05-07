import { CreateGameDto } from '../../game/dto/create-game.dto';
import { UpdateGameDto } from '../../game/dto/update-game.dto';
import { Game } from '../../game/entities/game.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const GameDocs = {
    create: () =>
        ApiGroup({
            tag: 'Games',
            summary: 'Create a new game',
            description: 'Creates a new game with the provided details.',
            bodyType: CreateGameDto,
            bodyExample: {
                title: "Chess Tournament Final",
                description: "Final match of the chess tournament between the top two players",
                idWon: 1,
                idLose: 2,
                beginDate: "2024-07-15",
                endDate: "2024-07-15",
                rules: "1. Standard chess rules apply\n2. Time control: 90 minutes + 30 seconds increment\n3. No draw offers before move 30",
                idEventParty: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Game created successfully',
                    type: Game,
                    example: {
                        idGame: 1,
                        title: "Chess Tournament Final",
                        description: "Final match of the chess tournament between the top two players",
                        idWon: 1,
                        idLose: 2,
                        beginDate: "2024-07-15",
                        endDate: "2024-07-15",
                        rules: "1. Standard chess rules apply\n2. Time control: 90 minutes + 30 seconds increment\n3. No draw offers before move 30",
                        idEventParty: 1
                    }
                },
                {
                    status: 400,
                    description: 'Bad request',
                    example: {
                        "statusCode": 400,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/games"
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
                        title: "Chess Tournament Final",
                        description: "Final match of the chess tournament between the top two players",
                        idWon: 1,
                        idLose: 2,
                        beginDate: "2024-07-15",
                        endDate: "2024-07-15",
                        rules: "1. Standard chess rules apply\n2. Time control: 90 minutes + 30 seconds increment\n3. No draw offers before move 30",
                        idEventParty: 1
                    },
                    {
                        idGame: 2,
                        title: "Poker Championship",
                        description: "Texas Hold'em poker tournament final table",
                        idWon: 3,
                        idLose: 4,
                        beginDate: "2024-07-20",
                        endDate: "2024-07-20",
                        rules: "1. Texas Hold'em rules\n2. Starting stack: 10,000 chips\n3. Blinds increase every 20 minutes",
                        idEventParty: 1
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
                        title: "Chess Tournament Final",
                        description: "Final match of the chess tournament between the top two players",
                        idWon: 1,
                        idLose: 2,
                        beginDate: "2024-07-15",
                        endDate: "2024-07-15",
                        rules: "1. Standard chess rules apply\n2. Time control: 90 minutes + 30 seconds increment\n3. No draw offers before move 30",
                        idEventParty: 1
                    }
                },
                {
                    status: 404,
                    description: 'Game not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/games/4"
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
                title: "Chess Tournament Final 2024",
                idWon: 2,
                idLose: 1,
                rules: "1. Standard chess rules apply\n2. Time control: 90 minutes + 30 seconds increment\n3. No draw offers before move 30\n4. New rule: Players must use their own chess clocks"
            },
            responses: [
                {
                    status: 200,
                    description: 'Game updated successfully',
                    type: Game,
                    example: {
                        idGame: 1,
                        title: "Chess Tournament Final 2024",
                        description: "Final match of the chess tournament between the top two players",
                        idWon: 2,
                        idLose: 1,
                        beginDate: "2024-07-15",
                        endDate: "2024-07-15",
                        rules: "1. Standard chess rules apply\n2. Time control: 90 minutes + 30 seconds increment\n3. No draw offers before move 30\n4. New rule: Players must use their own chess clocks",
                        idEventParty: 1
                    }
                },
                {
                    status: 404,
                    description: 'Game not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/games/4"
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
                    description: '',
                    example: {
                        message: ""
                    }
                },
                {
                    status: 404,
                    description: 'Game not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/games/4"
                    }
                }
            ],
        }),
}; 