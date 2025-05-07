import { CreateRoleDto } from '../../role/dto/create-role.dto';
import { UpdateRoleDto } from '../../role/dto/update-role.dto';
import { Role } from '../../role/entities/role.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const RoleDocs = {
    create: () =>
        ApiGroup({
            tag: 'Roles',
            summary: 'Create a new role',
            description: 'Creates a new role in the system.',
            bodyType: CreateRoleDto,
            bodyExample: {
                title: 'Admin',
                description: 'Administrator with full system access'
            },
            responses: [
                {
                    status: 201,
                    description: 'Role created successfully',
                    type: Role,
                    example: {
                        idRole: 1,
                        title: 'Admin',
                        description: 'Administrator with full system access'
                    }
                },
                {
                    status: 400,
                    description: 'Bad request',
                    example: {
                        "statusCode": 400,
                        "timestamp": "2025-04-21T17:42:32.749Z",
                        "path": "/api/role"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Roles',
            summary: 'Get all roles',
            description: 'Retrieves a list of all roles in the system.',
            responses: [{
                status: 200,
                description: 'List of roles retrieved successfully',
                type: [Role],
                example: [
                    {
                        idRole: 1,
                        title: 'Admin',
                        description: 'Administrator with full system access'
                    },
                    {
                        idRole: 2,
                        title: 'User',
                        description: 'Regular user with limited access'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Roles',
            summary: 'Get a role by ID',
            description: 'Retrieves a specific role by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the role to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Role found successfully',
                    type: Role,
                    example: {
                        idRole: 1,
                        title: 'Admin',
                        description: 'Administrator with full system access'
                    }
                },
                {
                    status: 404,
                    description: 'Role not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/role/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Roles',
            summary: 'Update a role',
            description: 'Updates the details of an existing role.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the role to update',
                example: 1
            },
            bodyType: UpdateRoleDto,
            bodyExample: {
                title: 'Super Admin',
                description: 'Super administrator with all system privileges'
            },
            responses: [
                {
                    status: 200,
                    description: 'Role updated successfully',
                    type: Role,
                    example: {
                        idRole: 1,
                        title: 'Super Admin',
                        description: 'Super administrator with all system privileges'
                    }
                },
                {
                    status: 404,
                    description: 'Role not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/role/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Roles',
            summary: 'Delete a role',
            description: 'Removes a role from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the role to delete',
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
                    description: 'Role not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/role/4"
                    }
                }
            ],
        }),
}; 