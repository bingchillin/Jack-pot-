import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PersonService } from '../person/person.service';

export interface PushNotificationData {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
  route?: string;
}

export interface PlantCareNotificationData extends PushNotificationData {
  plantId?: string;
  plantName?: string;
  sensorType?: string;
  alertLevel?: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(
    private configService: ConfigService,
    private personService: PersonService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const serviceAccountPath = process.cwd() + '/jackpotproject2025-bbbbb-firebase-adminsdk-fbsvc-5cc559041c.json';
        
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          projectId: 'jackpotproject2025-bbbbb',
        });

        this.logger.log('🔥 Firebase Admin SDK initialized successfully');
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (error) {
      this.logger.error('❌ Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a specific user by their ID
   */
  async sendNotificationToUser(
    userId: number,
    notification: PushNotificationData,
  ): Promise<boolean> {
    try {
      const person = await this.personService.findOne(userId);
      
      if (!person.fcmToken) {
        this.logger.warn(`⚠️ User ${userId} has no FCM token registered`);
        return false;
      }

      return await this.sendNotificationToToken(person.fcmToken, notification);
    } catch (error) {
      this.logger.error(`❌ Error sending notification to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send push notification to a specific FCM token
   */
  async sendNotificationToToken(
    token: string,
    notification: PushNotificationData,
  ): Promise<boolean> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          route: notification.route || '/plants',
          ...notification.data,
        },
        android: {
          notification: {
            channelId: 'jackpot_channel',
            priority: 'high' as any,
            defaultVibrateTimings: true,
            icon: '@mipmap/ic_launcher',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Error sending push notification:', error);
      
      // Handle invalid token errors
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn(`🗑️ Removing invalid FCM token: ${token}`);
        // TODO: Remove invalid token from database
      }
      
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(
    userIds: number[],
    notification: PushNotificationData,
  ): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendNotificationToUser(userId, notification))
    );

    const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - success;

    this.logger.log(`📊 Batch notification results: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Send notification to a topic (broadcast)
   */
  async sendNotificationToTopic(
    topic: string,
    notification: PushNotificationData,
  ): Promise<boolean> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          route: notification.route || '/plants',
          ...notification.data,
        },
        android: {
          notification: {
            channelId: 'jackpot_channel',
            priority: 'high' as any,
            defaultVibrateTimings: true,
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`📢 Topic notification sent to '${topic}': ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error sending topic notification to '${topic}':`, error);
      return false;
    }
  }

  /**
   * Register FCM token for a user
   */
  async registerUserToken(
    userId: number,
    fcmToken: string,
    platform: 'ios' | 'android' | 'web',
  ): Promise<boolean> {
    try {
      await this.personService.updateFcmToken(userId, fcmToken, platform);
      
      // Subscribe to plant care topics
      await this.subscribeToTopics(fcmToken, ['plant_care', 'watering_reminders']);
      
      this.logger.log(`📱 FCM token registered for user ${userId} on ${platform}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error registering FCM token for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Subscribe token to topics
   */
  async subscribeToTopics(token: string, topics: string[]): Promise<void> {
    try {
      const subscriptions = topics.map(topic => 
        admin.messaging().subscribeToTopic([token], topic)
      );

      await Promise.all(subscriptions);
      this.logger.log(`📋 Token subscribed to topics: ${topics.join(', ')}`);
    } catch (error) {
      this.logger.error('❌ Error subscribing to topics:', error);
    }
  }

  /**
   * Send plant care specific notifications
   */
  async sendPlantCareNotification(
    userId: number,
    plantNotification: PlantCareNotificationData,
  ): Promise<boolean> {
    const notification: PushNotificationData = {
      title: `🌱 ${plantNotification.title}`,
      body: plantNotification.body,
      route: plantNotification.route || '/plants',
      data: {
        type: 'plant_care',
        plantId: plantNotification.plantId || '',
        plantName: plantNotification.plantName || '',
        sensorType: plantNotification.sensorType || '',
        alertLevel: plantNotification.alertLevel || 'medium',
        timestamp: new Date().toISOString(),
      },
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send watering reminder notification
   */
  async sendWateringReminder(
    userId: number,
    plantName: string,
    daysOverdue?: number,
  ): Promise<boolean> {
    const title = daysOverdue 
      ? `💧 ${plantName} needs water urgently!`
      : `💧 Time to water ${plantName}`;
      
    const body = daysOverdue
      ? `Your ${plantName} is ${daysOverdue} days overdue for watering`
      : `Your ${plantName} is ready for its next watering`;

    return await this.sendPlantCareNotification(userId, {
      title,
      body,
      plantName,
      sensorType: 'moisture',
      alertLevel: daysOverdue && daysOverdue > 2 ? 'high' : 'medium',
      route: '/plants',
    });
  }

  /**
   * Send light level notification
   */
  async sendLightNotification(
    userId: number,
    plantName: string,
    lightLevel: 'too_low' | 'too_high',
  ): Promise<boolean> {
    const title = lightLevel === 'too_low' 
      ? `☀️ ${plantName} needs more light`
      : `🌞 ${plantName} is getting too much light`;
      
    const body = lightLevel === 'too_low'
      ? `Move your ${plantName} to a brighter location`
      : `Consider moving your ${plantName} to a shadier spot`;

    return await this.sendPlantCareNotification(userId, {
      title,
      body,
      plantName,
      sensorType: 'light',
      alertLevel: 'medium',
      route: '/plants',
    });
  }

  /**
   * Send temperature alert notification
   */
  async sendTemperatureAlert(
    userId: number,
    plantName: string,
    temperature: number,
    alertType: 'too_cold' | 'too_hot',
  ): Promise<boolean> {
    const title = alertType === 'too_cold'
      ? `🧊 ${plantName} is too cold`
      : `🔥 ${plantName} is too hot`;
      
    const body = `Current temperature: ${temperature}°C. Adjust the environment for optimal growth.`;

    return await this.sendPlantCareNotification(userId, {
      title,
      body,
      plantName,
      sensorType: 'temperature',
      alertLevel: 'high',
      route: '/plants',
      data: {
        temperature: temperature.toString(),
        alertType,
      },
    });
  }

  /**
   * Send soil nutrient notification
   */
  async sendNutrientAlert(
    userId: number,
    plantName: string,
    nutrientType: string,
    level: 'low' | 'depleted',
  ): Promise<boolean> {
    const title = level === 'depleted'
      ? `🚨 ${plantName} nutrients critically low`
      : `⚠️ ${plantName} nutrients running low`;
      
    const body = `${nutrientType} levels are ${level}. Consider fertilizing your plant.`;

    return await this.sendPlantCareNotification(userId, {
      title,
      body,
      plantName,
      sensorType: 'nutrients',
      alertLevel: level === 'depleted' ? 'critical' : 'medium',
      route: '/plants',
      data: {
        nutrientType,
        level,
      },
    });
  }
} 