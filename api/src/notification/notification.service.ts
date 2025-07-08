import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);
    
    // Send push notification if user has FCM token
    if (createNotificationDto.idPerson) {
      await this.firebaseService.sendNotificationToUser(
        createNotificationDto.idPerson,
        {
          title: createNotificationDto.title || 'Jack Pot Notification',
          body: createNotificationDto.description || 'You have a new notification',
          route: '/notifications',
          data: {
            notificationId: savedNotification.idNotification.toString(),
            type: 'general',
          },
        }
      );
    }
    
    return savedNotification;
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      relations: ['person', 'object'],
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { idNotification: id },
      relations: ['person', 'object'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByTitle(title: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { title },
      relations: ['person', 'object'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with title ${title} not found`);
    }

    return notification;
  }

  async findByPerson(personId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { idPerson: personId },
      relations: ['person', 'object'],
    });
  }

  async findByObject(objectId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { idObject: objectId },
      relations: ['person', 'object'],
    });
  }

  async findUnreadByPerson(personId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { idPerson: personId, isRead: false },
      relations: ['person', 'object'],
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(personId: number): Promise<void> {
    await this.notificationRepository.update(
      { idPerson: personId },
      { isRead: true }
    );
  }

  /**
   * Create and send plant care notification
   */
  async createPlantCareNotification(
    personId: number,
    objectId: number,
    title: string,
    description: string,
    advise: string,
    plantName?: string,
    sensorType?: string,
    alertLevel?: 'low' | 'medium' | 'high' | 'critical',
  ): Promise<Notification> {
    // Create database notification
    const notification = await this.create({
      idPerson: personId,
      idObject: objectId,
      title,
      description,
      advise,
    });

    // Send plant-specific push notification
    if (plantName) {
      await this.firebaseService.sendPlantCareNotification(personId, {
        title,
        body: description,
        plantName,
        sensorType,
        alertLevel: alertLevel || 'medium',
        route: '/plants',
        data: {
          notificationId: notification.idNotification.toString(),
          objectId: objectId.toString(),
        },
      });
    }

    return notification;
  }

  /**
   * Send watering reminder to user
   */
  async sendWateringReminder(
    personId: number,
    objectId: number,
    plantName: string,
    daysOverdue?: number,
  ): Promise<Notification> {
    const title = daysOverdue 
      ? `${plantName} needs water urgently!`
      : `Time to water ${plantName}`;
      
    const description = daysOverdue
      ? `Your ${plantName} is ${daysOverdue} days overdue for watering`
      : `Your ${plantName} is ready for its next watering`;

    const advise = 'Check the soil moisture and water if needed. Ensure proper drainage to prevent root rot.';

    return await this.createPlantCareNotification(
      personId,
      objectId,
      title,
      description,
      advise,
      plantName,
      'moisture',
      daysOverdue && daysOverdue > 2 ? 'high' : 'medium',
    );
  }

  /**
   * Send light level notification
   */
  async sendLightNotification(
    personId: number,
    objectId: number,
    plantName: string,
    lightLevel: 'too_low' | 'too_high',
  ): Promise<Notification> {
    const title = lightLevel === 'too_low' 
      ? `${plantName} needs more light`
      : `${plantName} is getting too much light`;
      
    const description = lightLevel === 'too_low'
      ? `Move your ${plantName} to a brighter location`
      : `Consider moving your ${plantName} to a shadier spot`;

    const advise = lightLevel === 'too_low'
      ? 'Most plants need bright, indirect light. Avoid direct sunlight which can burn leaves.'
      : 'Too much direct sunlight can damage plant leaves. Find a spot with filtered light.';

    return await this.createPlantCareNotification(
      personId,
      objectId,
      title,
      description,
      advise,
      plantName,
      'light',
      'medium',
    );
  }

  /**
   * Send temperature alert
   */
  async sendTemperatureAlert(
    personId: number,
    objectId: number,
    plantName: string,
    temperature: number,
    alertType: 'too_cold' | 'too_hot',
  ): Promise<Notification> {
    const title = alertType === 'too_cold'
      ? `${plantName} is too cold`
      : `${plantName} is too hot`;
      
    const description = `Current temperature: ${temperature}°C. Adjust the environment for optimal growth.`;

    const advise = alertType === 'too_cold'
      ? 'Move the plant away from cold drafts, windows, or air conditioning. Consider using a space heater nearby.'
      : 'Move the plant away from heat sources, direct sunlight, or heating vents. Increase ventilation if possible.';

    return await this.createPlantCareNotification(
      personId,
      objectId,
      title,
      description,
      advise,
      plantName,
      'temperature',
      'high',
    );
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async count(options?: FindManyOptions<Notification>): Promise<number> {
    return await this.notificationRepository.count(options);
  }
} 