import { CreatePlantDto } from '../../plant/dto/create-plant.dto';
import { UpdatePlantDto } from '../../plant/dto/update-plant.dto';
import { Plant } from '../../plant/entities/plant.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const PlantDocs = {
    create: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Create a new plant',
            description: 'Creates a new plant with the provided details.',
            bodyType: CreatePlantDto,
            bodyExample: {
                name: "Monstera Deliciosa",
                description: "A beautiful tropical plant with distinctive split leaves",
                price: 29.99,
                category: "Indoor",
                isAvailable: true,
                idPerson: 1
            },
            responses: [
                {
                    status: 201,
                    description: 'Plant created successfully',
                    type: Plant,
                    example: {
                        idPlant: 1,
                        name: "Monstera Deliciosa",
                        description: "A beautiful tropical plant with distinctive split leaves",
                        price: 29.99,
                        category: "Indoor",
                        isAvailable: true,
                        idPerson: 1
                    }
                },
                {
                    status: 400,
                    description: 'Bad request',
                    example: {
                        "statusCode": 400,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/plants"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Get all plants',
            description: 'Retrieves a list of all plants in the system.',
            responses: [{
                status: 200,
                description: 'List of plants retrieved successfully',
                type: [Plant],
                example: [
                    {
                        idPlant: 1,
                        name: "Monstera Deliciosa",
                        description: "A beautiful tropical plant with distinctive split leaves",
                        price: 29.99,
                        category: "Indoor",
                        isAvailable: true,
                        idPerson: 1
                    },
                    {
                        idPlant: 2,
                        name: "Fiddle Leaf Fig",
                        description: "A popular indoor tree with large, glossy leaves",
                        price: 49.99,
                        category: "Indoor",
                        isAvailable: true,
                        idPerson: 1
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Get a plant by ID',
            description: 'Retrieves a specific plant by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant found successfully',
                    type: Plant,
                    example: {
                        idPlant: 1,
                        name: "Monstera Deliciosa",
                        description: "A beautiful tropical plant with distinctive split leaves",
                        price: 29.99,
                        category: "Indoor",
                        isAvailable: true,
                        idPerson: 1
                    }
                },
                {
                    status: 404,
                    description: 'Plant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plants/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Update a plant',
            description: 'Updates the details of an existing plant.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant to update',
                example: 1
            },
            bodyType: UpdatePlantDto,
            bodyExample: {
                name: "Monstera Deliciosa",
                price: 34.99,
                isAvailable: false
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant updated successfully',
                    type: Plant,
                    example: {
                        idPlant: 1,
                        name: "Monstera Deliciosa",
                        description: "A beautiful tropical plant with distinctive split leaves",
                        price: 34.99,
                        category: "Indoor",
                        isAvailable: false,
                        idPerson: 1
                    }
                },
                {
                    status: 404,
                    description: 'Plant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plants/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Plants',
            summary: 'Delete a plant',
            description: 'Removes a plant from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant to delete',
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
                    description: 'Plant not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plants/4"
                    }
                }
            ],
        }),
}; 