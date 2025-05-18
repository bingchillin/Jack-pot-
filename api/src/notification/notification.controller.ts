import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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
  @ApiExcludeEndpoint()
  findByPerson(@Param('personId') personId: string): Promise<Notification[]> {
    return this.notificationService.findByPerson(+personId);
  }

  @Get('person/:personId/unread')
  @ApiExcludeEndpoint()
  findUnreadByPerson(@Param('personId') personId: string): Promise<Notification[]> {
    return this.notificationService.findUnreadByPerson(+personId);
  }

  @Get('object/:objectId')
  @ApiExcludeEndpoint()
  findByObject(@Param('objectId') objectId: string): Promise<Notification[]> {
    return this.notificationService.findByObject(+objectId);
  }

  @Patch(':id/read')
  @ApiExcludeEndpoint()
  markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(+id);
  }

  @Patch('person/:personId/read-all')
  @ApiExcludeEndpoint()
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