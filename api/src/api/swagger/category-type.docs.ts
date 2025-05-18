import { CreateCategoryTypeDto } from '../../category-type/dto/create-category-type.dto';
import { UpdateCategoryTypeDto } from '../../category-type/dto/update-category-type.dto';
import { CategoryType } from '../../category-type/entities/category-type.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const CategoryTypeDocs = {
    create: () =>
        ApiGroup({
            tag: 'Category Types',
            summary: 'Create a new category type',
            description: 'Creates a new category type with the provided details.',
            bodyType: CreateCategoryTypeDto,
            bodyExample: {
                title: 'Garden Furniture',
                description: 'Furniture items for garden use'
            },
            responses: [
                {
                    status: 201,
                    description: 'Category type created successfully',
                    type: CategoryType,
                    example: {
                        idCategoryType: 1,
                        title: 'Garden Furniture',
                        description: 'Furniture items for garden use',
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
                            'description must be a string'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Category Types',
            summary: 'Get all category types',
            description: 'Retrieves a list of all category types in the system.',
            responses: [{
                status: 200,
                description: 'List of category types retrieved successfully',
                type: [CategoryType],
                example: [
                    {
                        idCategoryType: 1,
                        title: 'Garden Furniture',
                        description: 'Furniture items for garden use',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idCategoryType: 2,
                        title: 'Plant Accessories',
                        description: 'Accessories for plants and gardening',
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Category Types',
            summary: 'Get a category type by ID',
            description: 'Retrieves a specific category type by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the category type to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Category type found successfully',
                    type: CategoryType,
                    example: {
                        idCategoryType: 1,
                        title: 'Garden Furniture',
                        description: 'Furniture items for garden use',
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Category type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/category-type/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Category Types',
            summary: 'Update a category type',
            description: 'Updates the details of an existing category type.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the category type to update',
                example: 1
            },
            bodyType: UpdateCategoryTypeDto,
            bodyExample: {
                title: 'Updated Garden Furniture',
                description: 'Updated furniture items for garden use'
            },
            responses: [
                {
                    status: 200,
                    description: 'Category type updated successfully',
                    type: CategoryType,
                    example: {
                        idCategoryType: 1,
                        title: 'Updated Garden Furniture',
                        description: 'Updated furniture items for garden use',
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
                    description: 'Category type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/category-type/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Category Types',
            summary: 'Delete a category type',
            description: 'Removes a category type from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the category type to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Category type deleted successfully',
                    example: {
                        message: 'Category type deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Category type not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/category-type/4"
                    }
                }
            ],
        }),
}; 