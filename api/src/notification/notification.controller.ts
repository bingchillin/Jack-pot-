import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ClassSerializerInterceptor, UseInterceptors, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';
import { SendPlantNotificationDto } from './dto/send-plant-notification.dto';
import { Notification } from './entities/notification.entity';
import { FirebaseService } from '../firebase/firebase.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('register-token')
  @ApiOperation({ summary: 'Register FCM token for push notifications' })
  @ApiResponse({ status: 200, description: 'FCM token registered successfully' })
  async registerFcmToken(
    @Request() req,
    @Body() registerFcmTokenDto: RegisterFcmTokenDto,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.idPerson;
    
    const success = await this.firebaseService.registerUserToken(
      userId,
      registerFcmTokenDto.fcmToken,
      registerFcmTokenDto.platform,
    );

    return {
      success,
      message: success 
        ? 'FCM token registered successfully' 
        : 'Failed to register FCM token',
    };
  }

  @Post('send-plant-notification')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Send plant care notification (Admin only)' })
  async sendPlantNotification(
    @Body() sendPlantNotificationDto: SendPlantNotificationDto,
  ): Promise<Notification> {
    return await this.notificationService.createPlantCareNotification(
      sendPlantNotificationDto.personId,
      sendPlantNotificationDto.objectId,
      sendPlantNotificationDto.title,
      sendPlantNotificationDto.description,
      sendPlantNotificationDto.advise,
      sendPlantNotificationDto.plantName,
      sendPlantNotificationDto.sensorType,
      sendPlantNotificationDto.alertLevel,
    );
  }

  @Post('watering-reminder')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Send watering reminder (System triggered)' })
  async sendWateringReminder(
    @Body() body: { personId: number; objectId: number; plantName: string; daysOverdue?: number },
  ): Promise<Notification> {
    return await this.notificationService.sendWateringReminder(
      body.personId,
      body.objectId,
      body.plantName,
      body.daysOverdue,
    );
  }

  @Post('light-notification')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Send light level notification (System triggered)' })
  async sendLightNotification(
    @Body() body: { personId: number; objectId: number; plantName: string; lightLevel: 'too_low' | 'too_high' },
  ): Promise<Notification> {
    return await this.notificationService.sendLightNotification(
      body.personId,
      body.objectId,
      body.plantName,
      body.lightLevel,
    );
  }

  @Post('temperature-alert')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Send temperature alert (System triggered)' })
  async sendTemperatureAlert(
    @Body() body: { personId: number; objectId: number; plantName: string; temperature: number; alertType: 'too_cold' | 'too_hot' },
  ): Promise<Notification> {
    return await this.notificationService.sendTemperatureAlert(
      body.personId,
      body.objectId,
      body.plantName,
      body.temperature,
      body.alertType,
    );
  }

  @Post('test-notification')
  @ApiOperation({ summary: 'Send test notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  async sendTestNotification(
    @Request() req,
    @Body() body: { title?: string; message?: string },
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.idPerson;
    
    const success = await this.firebaseService.sendNotificationToUser(userId, {
      title: body.title || '🌱 Jack Pot Test',
      body: body.message || 'This is a test notification from your plant care app!',
      route: '/plants',
      data: {
        type: 'test',
      },
    });

    return {
      success,
      message: success 
        ? 'Test notification sent successfully' 
        : 'Failed to send test notification',
    };
  }

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiExcludeEndpoint()
  findAll(): Promise<Notification[]> {
    return this.notificationService.findAll();
  }

  @Get('search')
  @ApiExcludeEndpoint()
  findByTitle(@Query('title') title: string): Promise<Notification> {
    return this.notificationService.findByTitle(title);
  }

  @Get('person/:personId')
  @ApiOperation({ summary: 'Get notifications for a person' })
  @ApiResponse({ status: 200, description: 'Returns notifications for the specified person' })
  findByPerson(@Param('personId') personId: string): Promise<Notification[]> {
    return this.notificationService.findByPerson(+personId);
  }

  @Get('person/:personId/unread')
  @ApiOperation({ summary: 'Get unread notifications for a person' })
  @ApiResponse({ status: 200, description: 'Returns unread notifications for the specified person' })
  findUnreadByPerson(@Param('personId') personId: string): Promise<Notification[]> {
    return this.notificationService.findUnreadByPerson(+personId);
  }

  @Get('object/:objectId')
  @ApiExcludeEndpoint()
  findByObject(@Param('objectId') objectId: string): Promise<Notification[]> {
    return this.notificationService.findByObject(+objectId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(+id);
  }

  @Patch('person/:personId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a person' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@Param('personId') personId: string): Promise<void> {
    return this.notificationService.markAllAsRead(+personId);
  }

  @Get(':id')
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string): Promise<void> {
    return this.notificationService.remove(+id);
  }
} 