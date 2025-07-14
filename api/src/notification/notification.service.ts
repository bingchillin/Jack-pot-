import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { Person } from '../person/entities/person.entity';
import { Contact, ContactStatus } from '../contact/entities/contact.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Safety check: Don't create notifications where the recipient and triggering person are the same
    if (createNotificationDto.idTriggeringPerson && 
        createNotificationDto.idPerson === createNotificationDto.idTriggeringPerson) {
      console.log('Skipping self-notification:', createNotificationDto);
      return null;
    }

    // Check if users are blocked
    if (createNotificationDto.idTriggeringPerson) {
      const isBlocked = await this.areUsersBlocked(
        createNotificationDto.idTriggeringPerson,
        createNotificationDto.idPerson
      );
      if (isBlocked) {
        console.log('Skipping notification due to blocking:', createNotificationDto);
        return null;
      }
    }

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

  // ===============================
  // SOCIAL NOTIFICATIONS METHODS
  // ===============================

  /**
   * Create like notification when someone likes a comment
   */
  async createLikeNotification(
    commentId: number,
    commentAuthorId: number,
    likerId: number,
    commentContent: string,
  ): Promise<Notification | null> {
    // Don't notify if user likes their own comment
    if (commentAuthorId === likerId) {
      return null;
    }

    // Get liker info for the notification
    const liker = await this.personRepository.findOne({
      where: { idPerson: likerId },
    });

    if (!liker) {
      return null;
    }

    const likerName = liker.firstname && liker.surname 
      ? `${liker.firstname} ${liker.surname}`
      : liker.email.split('@')[0];

    const title = `${likerName} a aimé votre commentaire`;
    const description = commentContent.length > 100 
      ? `"${commentContent.substring(0, 100)}..."` 
      : `"${commentContent}"`;

    const notification = await this.create({
      idPerson: commentAuthorId,
      title,
      description,
      notificationType: 'comment_like',
      idComment: commentId,
      idTriggeringPerson: likerId,
    });

    // Note: Push notification is already sent by create() method
    return notification;
  }

  /**
   * Create mention notification when someone is mentioned in a comment
   */
  async createMentionNotification(
    commentId: number,
    mentionedPersonId: number,
    mentionerId: number,
    commentContent: string,
  ): Promise<Notification | null> {
    // Don't notify if user mentions themselves
    if (mentionedPersonId === mentionerId) {
      return null;
    }

    // Get mentioner info for the notification
    const mentioner = await this.personRepository.findOne({
      where: { idPerson: mentionerId },
    });

    if (!mentioner) {
      return null;
    }

    const mentionerName = mentioner.firstname && mentioner.surname 
      ? `${mentioner.firstname} ${mentioner.surname}`
      : mentioner.email.split('@')[0];

    const title = `${mentionerName} vous a mentionné`;
    const description = commentContent.length > 100 
      ? `"${commentContent.substring(0, 100)}..."` 
      : `"${commentContent}"`;

    const notification = await this.create({
      idPerson: mentionedPersonId,
      title,
      description,
      notificationType: 'comment_mention',
      idComment: commentId,
      idTriggeringPerson: mentionerId,
    });

    // Note: Push notification is already sent by create() method
    return notification;
  }

  /**
   * Create reply notification when someone replies to a comment
   */
  async createReplyNotification(
    parentCommentId: number,
    parentCommentAuthorId: number,
    replierId: number,
    replyContent: string,
  ): Promise<Notification | null> {
    // Don't notify if user replies to their own comment
    if (parentCommentAuthorId === replierId) {
      return null;
    }

    // Get replier info for the notification
    const replier = await this.personRepository.findOne({
      where: { idPerson: replierId },
    });

    if (!replier) {
      return null;
    }

    const replierName = replier.firstname && replier.surname 
      ? `${replier.firstname} ${replier.surname}`
      : replier.email.split('@')[0];

    const title = `${replierName} a répondu à votre commentaire`;
    const description = replyContent.length > 100 
      ? `"${replyContent.substring(0, 100)}..."` 
      : `"${replyContent}"`;

    const notification = await this.create({
      idPerson: parentCommentAuthorId,
      title,
      description,
      notificationType: 'comment_reply',
      idComment: parentCommentId,
      idTriggeringPerson: replierId,
    });

    // Note: Push notification is already sent by create() method
    return notification;
  }

  /**
   * Get social notifications for a user (likes, mentions, replies)
   */
  async getSocialNotifications(personId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { 
        idPerson: personId,
        notificationType: In(['comment_like', 'comment_mention', 'comment_reply']),
      },
      relations: ['triggeringPerson'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all notifications by type for a user
   */
  async getNotificationsByType(personId: number, type: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { 
        idPerson: personId,
        notificationType: type,
      },
      relations: ['triggeringPerson', 'person', 'object'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get mixed notifications (social + plant care) for a user
   */
  async getAllNotificationsForUser(personId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { idPerson: personId },
      relations: ['triggeringPerson', 'person', 'object'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if two users have blocked each other
   */
  private async areUsersBlocked(userId1: number, userId2: number): Promise<boolean> {
    try {
      const blockingContact = await this.contactRepository.findOne({
        where: [
          { requesterId: userId1, receiverId: userId2, status: ContactStatus.BLOCKED },
          { requesterId: userId2, receiverId: userId1, status: ContactStatus.BLOCKED }
        ]
      });
      
      return !!blockingContact;
    } catch (error) {
      console.error('Error checking blocking status:', error);
      return false; // If there's an error, don't block notifications
    }
  }
} 