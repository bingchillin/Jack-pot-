import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from '../notification/notification.service';
import { ObjectProfileService } from '../object-profile/object-profile.service';
import { SensorDataDto } from './dto/sensor-data.dto';

@ApiTags('sensors')
@Controller('sensors')
export class SensorsController {
  private readonly logger = new Logger(SensorsController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly objectProfileService: ObjectProfileService,
  ) {}

  @Post('data')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Receive sensor data and trigger notifications' })
  @ApiResponse({ status: 200, description: 'Sensor data processed successfully' })
  async receiveSensorData(@Body() sensorData: SensorDataDto): Promise<{ success: boolean; notifications: number }> {
    this.logger.log(`📊 Received sensor data for object ${sensorData.objectId}`);
    
    let notificationCount = 0;

    try {
      // Get object profile information
      const objectProfile = await this.objectProfileService.findOne(sensorData.objectId);
      
      if (!objectProfile || !objectProfile.person) {
        this.logger.warn(`⚠️ Object profile not found or no owner for object ${sensorData.objectId}`);
        return { success: false, notifications: 0 };
      }

      const userId = objectProfile.person.idPerson;
      const plantName = objectProfile.title || 'Your plant';

      // Process moisture sensor data
      if (sensorData.moisture !== undefined) {
        if (sensorData.moisture < 20) {
          await this.notificationService.sendWateringReminder(
            userId,
            sensorData.objectId,
            plantName,
            sensorData.moisture < 10 ? 3 : undefined // Days overdue if critically low
          );
          notificationCount++;
          this.logger.log(`💧 Watering reminder sent for ${plantName} (moisture: ${sensorData.moisture}%)`);
        }
      }

      // Process light sensor data
      if (sensorData.lightLevel !== undefined) {
        if (sensorData.lightLevel < 200) {
          await this.notificationService.sendLightNotification(
            userId,
            sensorData.objectId,
            plantName,
            'too_low'
          );
          notificationCount++;
          this.logger.log(`☀️ Low light notification sent for ${plantName} (light: ${sensorData.lightLevel} lux)`);
        } else if (sensorData.lightLevel > 5000) {
          await this.notificationService.sendLightNotification(
            userId,
            sensorData.objectId,
            plantName,
            'too_high'
          );
          notificationCount++;
          this.logger.log(`🌞 High light notification sent for ${plantName} (light: ${sensorData.lightLevel} lux)`);
        }
      }

      // Process temperature sensor data
      if (sensorData.temperature !== undefined) {
        if (sensorData.temperature < 15) {
          await this.notificationService.sendTemperatureAlert(
            userId,
            sensorData.objectId,
            plantName,
            sensorData.temperature,
            'too_cold'
          );
          notificationCount++;
          this.logger.log(`🧊 Cold temperature alert sent for ${plantName} (temp: ${sensorData.temperature}°C)`);
        } else if (sensorData.temperature > 30) {
          await this.notificationService.sendTemperatureAlert(
            userId,
            sensorData.objectId,
            plantName,
            sensorData.temperature,
            'too_hot'
          );
          notificationCount++;
          this.logger.log(`🔥 Hot temperature alert sent for ${plantName} (temp: ${sensorData.temperature}°C)`);
        }
      }

      // Process soil nutrients data (if available)
      if (sensorData.soilNutrients !== undefined) {
        if (sensorData.soilNutrients < 10) {
          // Create a custom notification for soil nutrients
          await this.notificationService.createPlantCareNotification(
            userId,
            sensorData.objectId,
            `${plantName} needs fertilizer`,
            `Soil nutrient level is critically low (${sensorData.soilNutrients}%). Consider fertilizing your plant.`,
            'Use a balanced fertilizer according to your plant type. Avoid over-fertilizing which can damage roots.',
            plantName,
            'nutrients',
            'high'
          );
          notificationCount++;
          this.logger.log(`🌱 Nutrient alert sent for ${plantName} (nutrients: ${sensorData.soilNutrients}%)`);
        }
      }

      this.logger.log(`✅ Processed sensor data for ${plantName}, sent ${notificationCount} notifications`);
      
      return { success: true, notifications: notificationCount };
    } catch (error) {
      this.logger.error(`❌ Error processing sensor data for object ${sensorData.objectId}:`, error);
      return { success: false, notifications: 0 };
    }
  }

  @Post('test-alert')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send test plant care alert' })
  @ApiResponse({ status: 200, description: 'Test alert sent successfully' })
  async sendTestAlert(
    @Body() testData: { objectId: number; alertType: 'watering' | 'light' | 'temperature' | 'nutrients' }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const objectProfile = await this.objectProfileService.findOne(testData.objectId);
      
      if (!objectProfile || !objectProfile.person) {
        return { success: false, message: 'Object profile not found or no owner' };
      }

      const userId = objectProfile.person.idPerson;
      const plantName = objectProfile.title || 'Test Plant';

      switch (testData.alertType) {
        case 'watering':
          await this.notificationService.sendWateringReminder(userId, testData.objectId, plantName, 2);
          break;
        case 'light':
          await this.notificationService.sendLightNotification(userId, testData.objectId, plantName, 'too_low');
          break;
        case 'temperature':
          await this.notificationService.sendTemperatureAlert(userId, testData.objectId, plantName, 35, 'too_hot');
          break;
        case 'nutrients':
          await this.notificationService.createPlantCareNotification(
            userId,
            testData.objectId,
            `${plantName} needs fertilizer`,
            'This is a test nutrient alert',
            'Test advice for nutrient management',
            plantName,
            'nutrients',
            'medium'
          );
          break;
      }

      return { success: true, message: `Test ${testData.alertType} alert sent successfully` };
    } catch (error) {
      this.logger.error('Error sending test alert:', error);
      return { success: false, message: 'Failed to send test alert' };
    }
  }
} 