import { CreatePlantPersonDto } from '../../plant-person/dto/create-plant-person.dto';
import { UpdatePlantPersonDto } from '../../plant-person/dto/update-plant-person.dto';
import { PlantPerson } from '../../plant-person/entities/plant-person.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const PlantPersonDocs = {
    create: () =>
        ApiGroup({
            tag: 'Plant-Person Relationships',
            summary: 'Create a new plant-person relationship',
            description: 'Creates a new relationship between a plant and a person.',
            bodyType: CreatePlantPersonDto,
            bodyExample: {
                idPlant: 1,
                idPerson: 1,
                isOwner: true,
                isSeller: false
            },
            responses: [
                {
                    status: 201,
                    description: 'Plant-Person relationship created successfully',
                    type: PlantPerson,
                    example: {
                        idPlantPerson: 1,
                        idPlant: 1,
                        idPerson: 1,
                        isOwner: true,
                        isSeller: false
                    }
                },
                {
                    status: 400,
                    description: 'Bad request',
                    example: {
                        "statusCode": 400,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/plant-person"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Plant-Person Relationships',
            summary: 'Get all plant-person relationships',
            description: 'Retrieves a list of all plant-person relationships in the system. Can be filtered by plantId or personId.',
            responses: [{
                status: 200,
                description: 'List of plant-person relationships retrieved successfully',
                type: [PlantPerson],
                example: [
                    {
                        idPlantPerson: 1,
                        idPlant: 1,
                        idPerson: 1,
                        isOwner: true,
                        isSeller: false
                    },
                    {
                        idPlantPerson: 2,
                        idPlant: 1,
                        idPerson: 2,
                        isOwner: false,
                        isSeller: true
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Plant-Person Relationships',
            summary: 'Get a plant-person relationship by ID',
            description: 'Retrieves a specific plant-person relationship by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant-person relationship to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant-Person relationship found successfully',
                    type: PlantPerson,
                    example: {
                        idPlantPerson: 1,
                        idPlant: 1,
                        idPerson: 1,
                        isOwner: true,
                        isSeller: false
                    }
                },
                {
                    status: 404,
                    description: 'Plant-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant-person/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Plant-Person Relationships',
            summary: 'Update a plant-person relationship',
            description: 'Updates the details of an existing plant-person relationship.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant-person relationship to update',
                example: 1
            },
            bodyType: UpdatePlantPersonDto,
            bodyExample: {
                isOwner: false,
                isSeller: true
            },
            responses: [
                {
                    status: 200,
                    description: 'Plant-Person relationship updated successfully',
                    type: PlantPerson,
                    example: {
                        idPlantPerson: 1,
                        idPlant: 1,
                        idPerson: 1,
                        isOwner: false,
                        isSeller: true
                    }
                },
                {
                    status: 404,
                    description: 'Plant-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant-person/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Plant-Person Relationships',
            summary: 'Delete a plant-person relationship',
            description: 'Removes a plant-person relationship from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the plant-person relationship to delete',
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
                    description: 'Plant-Person relationship not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/plant-person/4"
                    }
                }
            ],
        }),
}; 