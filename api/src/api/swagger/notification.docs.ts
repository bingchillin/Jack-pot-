import { CreateNotificationDto } from '../../notification/dto/create-notification.dto';
import { UpdateNotificationDto } from '../../notification/dto/update-notification.dto';
import { Notification } from '../../notification/entities/notification.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const NotificationDocs = {
    create: () =>
        ApiGroup({
            tag: 'Notifications',
            summary: 'Create a new notification',
            description: 'Creates a new notification for a person.',
            bodyType: CreateNotificationDto,
            bodyExample: {
                idPerson: 1,
                title: 'New Message',
                message: 'You have received a new message from John Doe',
                isRead: false
            },
            responses: [
                {
                    status: 201,
                    description: 'Notification created successfully',
                    type: Notification,
                    example: {
                        idNotification: 1,
                        idPerson: 1,
                        title: 'New Message',
                        message: 'You have received a new message from John Doe',
                        isRead: false,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
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
                            'message must be a string',
                            'idPerson must be a number'
                        ],
                        error: 'Bad Request'
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Notifications',
            summary: 'Get all notifications',
            description: 'Retrieves a list of all notifications in the system. Can be filtered by personId.',
            responses: [{
                status: 200,
                description: 'List of notifications retrieved successfully',
                type: [Notification],
                example: [
                    {
                        idNotification: 1,
                        idPerson: 1,
                        title: 'New Message',
                        message: 'You have received a new message from John Doe',
                        isRead: false,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idNotification: 2,
                        idPerson: 1,
                        title: 'Event Reminder',
                        message: 'Your event "Party" starts in 1 hour',
                        isRead: true,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T11:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
                    }
                ]
            }],
        }),

    findOne: () =>
        ApiGroup({
            tag: 'Notifications',
            summary: 'Get a notification by ID',
            description: 'Retrieves a specific notification by its ID.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the notification to retrieve',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Notification found successfully',
                    type: Notification,
                    example: {
                        idNotification: 1,
                        idPerson: 1,
                        title: 'New Message',
                        message: 'You have received a new message from John Doe',
                        isRead: false,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    }
                },
                {
                    status: 404,
                    description: 'Notification not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/notification/4"
                    }
                }
            ],
        }),

    update: () =>
        ApiGroup({
            tag: 'Notifications',
            summary: 'Update a notification',
            description: 'Updates the details of an existing notification.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the notification to update',
                example: 1
            },
            bodyType: UpdateNotificationDto,
            bodyExample: {
                isRead: true
            },
            responses: [
                {
                    status: 200,
                    description: 'Notification updated successfully',
                    type: Notification,
                    example: {
                        idNotification: 1,
                        idPerson: 1,
                        title: 'New Message',
                        message: 'You have received a new message from John Doe',
                        isRead: true,
                        person: {
                            idPerson: 1,
                            mail: 'john.doe@example.com',
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
                            'isRead must be a boolean'
                        ],
                        error: 'Bad Request'
                    }
                },
                {
                    status: 404,
                    description: 'Notification not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/notification/4"
                    }
                }
            ],
        }),

    remove: () =>
        ApiGroup({
            tag: 'Notifications',
            summary: 'Delete a notification',
            description: 'Removes a notification from the system.',
            param: {
                name: 'id',
                type: Number,
                description: 'The ID of the notification to delete',
                example: 1
            },
            responses: [
                {
                    status: 200,
                    description: 'Notification deleted successfully',
                    example: {
                        message: 'Notification deleted successfully'
                    }
                },
                {
                    status: 404,
                    description: 'Notification not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/notification/4"
                    }
                }
            ],
        }),
}; 