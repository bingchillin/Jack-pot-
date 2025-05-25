import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { UpdateNotificationDto } from 'src/notification/dto/update-notification.dto';
import { Notification } from 'src/notification/entities/notification.entity';
import { ApiGroup } from '../decorator/api-group.decorator';

export const NotificationDocs = {
    create: () =>
        ApiGroup({
            tag: 'Notifications',
            summary: 'Create a new notification',
            description: 'Creates a new notification for a user.',
            bodyType: CreateNotificationDto,
            bodyExample: {
                idPerson: 1,
                title: "New Plant Care Reminder",
                message: "Time to water your rose bush!",
                type: "REMINDER",
                isRead: false
            },
            responses: [
                {
                    status: 201,
                    description: 'Notification created successfully',
                    type: Notification,
                    example: {
                        idNotification: 1,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        title: "New Plant Care Reminder",
                        message: "Time to water your rose bush!",
                        type: "REMINDER",
                        isRead: false,
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
                            'idPerson must be a number',
                            'title must be a string',
                            'message must be a string',
                            'type must be one of: INFO, WARNING, ERROR, SUCCESS, REMINDER',
                            'isRead must be a boolean'
                        ],
                        error: "Bad Request"
                    }
                },
                {
                    status: 404,
                    description: 'Person not found',
                    example: {
                        "statusCode": 404,
                        "timestamp": "2025-04-21T17:44:57.369Z",
                        "path": "/api/notification"
                    }
                }
            ],
        }),

    findAll: () =>
        ApiGroup({
            tag: 'Notifications',
            summary: 'Get all notifications',
            description: 'Retrieves a list of all notifications in the system.',
            responses: [{
                status: 200,
                description: 'List of notifications retrieved successfully',
                type: [Notification],
                example: [
                    {
                        idNotification: 1,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        title: "New Plant Care Reminder",
                        message: "Time to water your rose bush!",
                        type: "REMINDER",
                        isRead: false,
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T10:30:00.000Z'
                    },
                    {
                        idNotification: 2,
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        title: "Event Registration Confirmation",
                        message: "You have successfully registered for the Spring Garden Party!",
                        type: "SUCCESS",
                        isRead: true,
                        createdAt: '2024-03-18T15:45:00.000Z',
                        updatedAt: '2024-03-18T15:45:00.000Z'
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
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        title: "New Plant Care Reminder",
                        message: "Time to water your rose bush!",
                        type: "REMINDER",
                        isRead: false,
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
                        person: {
                            idPerson: 1,
                            email: 'john.doe@example.com',
                            firstname: 'John',
                            surname: 'Doe'
                        },
                        title: "New Plant Care Reminder",
                        message: "Time to water your rose bush!",
                        type: "REMINDER",
                        isRead: true,
                        createdAt: '2024-03-19T10:30:00.000Z',
                        updatedAt: '2024-03-19T11:30:00.000Z'
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