import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
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
      { idPerson: personId, isRead: false },
      { isRead: true },
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
} 