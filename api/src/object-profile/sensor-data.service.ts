import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { PersonService } from '../person/person.service';
import { ObjectProfileService } from './object-profile.service';

export interface SensorData {
  humidityAirSensor: number;
  humidityGroundSensor: number;
  phGroundSensor: number;
  conductivityElectriqueFertilitySensor: number;
  lightSensor: number;
  temperatureSensorGround: number;
  temperatureSensorExtern: number;
  expositionTimeSun: number;
  water_sensor: number;
}

export interface ProcessedSensorData {
  moisture: number;
  light: number;
  temperature: number;
  soilNutrients: number;
  airHumidity: number;
  waterLevel: number;
  plantName: string;
  objectId: number;
}

@Injectable()
export class SensorDataService {
  private readonly logger = new Logger(SensorDataService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly personService: PersonService,
    private readonly objectProfileService: ObjectProfileService,
  ) {}

  /**
   * Process raw sensor data from ESP32 and trigger notifications
   */
  async processSensorData(objectId: number, rawData: SensorData): Promise<{
    success: boolean;
    processedData: ProcessedSensorData;
    alertsSent: Array<{ type: string; level: string; message: string }>;
  }> {
    try {
      this.logger.log(`🔍 Processing sensor data for object ${objectId}`);

      // Process and validate sensor data
      const processedData = this.processRawSensorData(rawData, objectId);
      
      // Check for alert conditions and send notifications
      const alertsSent = await this.checkAndSendAlerts(processedData);

      this.logger.log(`✅ Sensor data processed successfully - ${alertsSent.length} alerts sent`);

      return {
        success: true,
        processedData,
        alertsSent,
      };
    } catch (error) {
      this.logger.error(`❌ Error processing sensor data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert raw ESP32 sensor data to processed values
   */
  private processRawSensorData(rawData: SensorData, objectId: number): ProcessedSensorData {
    return {
      moisture: this.processMoistureSensor(rawData.humidityGroundSensor),
      light: this.processLightSensor(rawData.lightSensor),
      temperature: this.processTemperatureSensor(rawData.temperatureSensorGround),
      soilNutrients: this.processNutrientSensor(rawData.conductivityElectriqueFertilitySensor),
      airHumidity: this.processAirHumiditySensor(rawData.humidityAirSensor),
      waterLevel: this.processWaterSensor(rawData.water_sensor),
      plantName: 'My Plant', // TODO: Get from database
      objectId,
    };
  }

  /**
   * Process soil moisture sensor (capacitive sensor values)
   * ESP32 range: 0-4095, where lower = more moisture
   */
  private processMoistureSensor(rawValue: number): number {
    // Convert ESP32 analog reading (0-4095) to moisture percentage
    // ~3000 = dry soil, ~1000 = wet soil
    const moisturePercentage = Math.max(0, Math.min(100, ((4095 - rawValue) / 4095) * 100));
    
    this.logger.debug(`💧 Moisture: raw=${rawValue}, processed=${moisturePercentage.toFixed(1)}%`);
    
    return Math.round(moisturePercentage * 10) / 10; // Round to 1 decimal
  }

  /**
   * Process light sensor (UV LED status)
   */
  private processLightSensor(rawValue: number): number {
    // Convert binary light sensor to lux approximation
    // 0 = no light, 1 = light detected
    const lightLux = rawValue > 0 ? 800 : 200; // Approximate values
    
    this.logger.debug(`💡 Light: raw=${rawValue}, processed=${lightLux} lux`);
    
    return lightLux;
  }

  /**
   * Process temperature sensor (ground temperature)
   */
  private processTemperatureSensor(rawValue: number): number {
    // Temperature is already in Celsius, just validate range
    const temperature = Math.max(-40, Math.min(80, rawValue));
    
    this.logger.debug(`🌡️ Temperature: ${temperature.toFixed(1)}°C`);
    
    return Math.round(temperature * 10) / 10; // Round to 1 decimal
  }

  /**
   * Process soil nutrient sensor (electrical conductivity)
   */
  private processNutrientSensor(rawValue: number): number {
    // Convert conductivity to nutrient percentage
    // Placeholder: assume 0-100% range
    const nutrientPercentage = Math.max(0, Math.min(100, rawValue));
    
    this.logger.debug(`🌱 Nutrients: ${nutrientPercentage.toFixed(1)}%`);
    
    return Math.round(nutrientPercentage * 10) / 10; // Round to 1 decimal
  }

  /**
   * Process air humidity sensor
   */
  private processAirHumiditySensor(rawValue: number): number {
    // Air humidity is already in percentage, just validate range
    const humidity = Math.max(0, Math.min(100, rawValue));
    
    this.logger.debug(`💨 Air Humidity: ${humidity.toFixed(1)}%`);
    
    return Math.round(humidity * 10) / 10; // Round to 1 decimal
  }

  /**
   * Process water level sensor
   */
  private processWaterSensor(rawValue: number): number {
    // ESP32 water sensor range: 0-700
    // 0 = dry, 400 = medium, 700 = full
    const waterPercentage = Math.max(0, Math.min(100, (rawValue / 700) * 100));
    
    this.logger.debug(`💧 Water Level: raw=${rawValue}, processed=${waterPercentage.toFixed(1)}%`);
    
    return Math.round(waterPercentage * 10) / 10; // Round to 1 decimal
  }

  /**
   * Check sensor thresholds and send consolidated notifications
   */
  private async checkAndSendAlerts(processedData: ProcessedSensorData): Promise<Array<{ type: string; level: string; message: string }>> {
    const alerts: Array<{ type: string; level: string; message: string }> = [];

    try {
      // Get users associated with this object
      const { users, objectProfile } = await this.getUsersForObject(processedData.objectId);
      
      if (users.length === 0) {
        this.logger.warn(`⚠️ No users found for object ${processedData.objectId}`);
        return alerts;
      }

      // Use the correct object ID for notifications (from objectProfile.idObject)
      const correctObjectId = objectProfile?.idObject || processedData.objectId;
      this.logger.log(`🎯 Using object ID ${correctObjectId} for notifications`);

      // Check all sensor levels and collect alerts
      const moistureAlert = this.checkMoistureAlert(processedData.moisture, processedData.plantName);
      this.logger.debug(`💧 Moisture check: ${processedData.moisture}% -> Alert: ${moistureAlert ? moistureAlert.level : 'none'}`);
      if (moistureAlert) alerts.push(moistureAlert);

      const lightAlert = this.checkLightAlert(processedData.light, processedData.plantName);
      if (lightAlert) alerts.push(lightAlert);

      const temperatureAlert = this.checkTemperatureAlert(processedData.temperature, processedData.plantName);
      if (temperatureAlert) alerts.push(temperatureAlert);

      const nutrientAlert = this.checkNutrientAlert(processedData.soilNutrients, processedData.plantName);
      if (nutrientAlert) alerts.push(nutrientAlert);

      const waterAlert = this.checkWaterLevelAlert(processedData.waterLevel, processedData.plantName);
      if (waterAlert) alerts.push(waterAlert);

      // Send consolidated notification if there are any alerts
      if (alerts.length > 0) {
        await this.sendConsolidatedAlert(users, processedData, alerts, correctObjectId);
        this.logger.log(`📱 Sent consolidated notification with ${alerts.length} alerts`);
      } else {
        this.logger.log(`✅ All sensors within normal ranges - no alerts needed`);
      }

    } catch (error) {
      this.logger.error(`❌ Error sending alerts: ${error.message}`);
    }

    return alerts;
  }

  /**
   * Check moisture threshold and return alert if needed
   */
  private checkMoistureAlert(moisture: number, plantName: string): { type: string; level: string; message: string } | null {
    if (moisture < 10) {
      return {
        type: 'watering',
        level: 'urgent',
        message: `${plantName} needs immediate watering! 🚨`,
      };
    } else if (moisture < 20) {
      return {
        type: 'watering',
        level: 'normal',
        message: `${plantName} needs watering soon 💧`,
      };
    }
    return null;
  }

  /**
   * Check light threshold and return alert if needed
   */
  private checkLightAlert(light: number, plantName: string): { type: string; level: string; message: string } | null {
    if (light < 200) {
      return {
        type: 'light',
        level: 'normal',
        message: `${plantName} needs more light 💡`,
      };
    } else if (light > 5000) {
      return {
        type: 'light',
        level: 'normal',
        message: `${plantName} is getting too much light! ☀️`,
      };
    }
    return null;
  }

  /**
   * Check temperature threshold and return alert if needed
   */
  private checkTemperatureAlert(temperature: number, plantName: string): { type: string; level: string; message: string } | null {
    if (temperature < 15) {
      return {
        type: 'temperature',
        level: 'normal',
        message: `${plantName} is too cold! 🌡️`,
      };
    } else if (temperature > 30) {
      return {
        type: 'temperature',
        level: 'normal',
        message: `${plantName} is too hot! 🌡️`,
      };
    }
    return null;
  }

  /**
   * Check nutrient threshold and return alert if needed
   */
  private checkNutrientAlert(nutrients: number, plantName: string): { type: string; level: string; message: string } | null {
    if (nutrients < 10) {
      return {
        type: 'nutrients',
        level: 'normal',
        message: `${plantName} needs fertilizer 🌱`,
      };
    }
    return null;
  }

  /**
   * Check water level threshold and return alert if needed
   */
  private checkWaterLevelAlert(waterLevel: number, plantName: string): { type: string; level: string; message: string } | null {
    if (waterLevel > 90) {
      return {
        type: 'water_level',
        level: 'normal',
        message: `${plantName} water level is too high! 💧`,
      };
    }
    return null;
  }

  /**
   * Send consolidated alert with all sensor issues
   */
  private async sendConsolidatedAlert(
    users: any[], 
    processedData: ProcessedSensorData, 
    alerts: Array<{ type: string; level: string; message: string }>, 
    objectId: number
  ): Promise<void> {
    for (const user of users) {
      try {
        // Determine the overall alert level (highest priority wins)
        const alertLevel = this.determineOverallAlertLevel(alerts);
        
        // Create the consolidated title and description
        const { title, description, advise } = this.createConsolidatedContent(processedData.plantName, alerts);
        
        // Send the consolidated notification
        await this.notificationService.createPlantCareNotification(
          user.idPerson,
          objectId,
          title,
          description,
          advise,
          processedData.plantName,
          'sensor_consolidated',
          alertLevel,
        );
        
        this.logger.log(`✅ Consolidated alert sent to user ${user.idPerson} with ${alerts.length} issues`);
      } catch (error) {
        this.logger.error(`❌ Failed to send consolidated alert to user ${user.idPerson}: ${error.message}`);
      }
    }
  }

  /**
   * Determine the overall alert level based on all alerts
   */
  private determineOverallAlertLevel(alerts: Array<{ type: string; level: string; message: string }>): 'low' | 'medium' | 'high' | 'critical' {
    if (alerts.some(alert => alert.level === 'urgent')) return 'critical';
    if (alerts.some(alert => alert.level === 'high')) return 'high';
    if (alerts.some(alert => alert.level === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Create consolidated notification content
   */
  private createConsolidatedContent(
    plantName: string, 
    alerts: Array<{ type: string; level: string; message: string }>
  ): { title: string; description: string; advise: string } {
    
    const alertCount = alerts.length;
    const urgentCount = alerts.filter(a => a.level === 'urgent').length;
    
    // Create concise title (max ~50 chars)
    let title: string;
    if (urgentCount > 0) {
      title = `🚨 ${plantName} - Urgent!`;
    } else if (alertCount > 2) {
      title = `⚠️ ${plantName} - ${alertCount} issues`;
    } else {
      title = `🌱 ${plantName} - Needs care`;
    }
    
    // Create short description (max ~100 chars for push notification)
    const description = this.createShortDescription(alerts, plantName);
    
    // Create comprehensive advice for the app
    const advise = this.createComprehensiveAdvice(alerts);
    
    return { title, description, advise };
  }

  /**
   * Create short description that fits in push notification
   */
  private createShortDescription(
    alerts: Array<{ type: string; level: string; message: string }>,
    plantName: string
  ): string {
    const alertCount = alerts.length;
    
    if (alertCount === 1) {
      // Single alert - be specific but concise
      const alert = alerts[0];
      
      switch (alert.type) {
        case 'watering':
          return alert.level === 'urgent' 
            ? `💧 Needs water urgently!`
            : `💧 Time to water`;
        case 'light':
          return `💡 Light issue detected`;
        case 'temperature':
          return `🌡️ Temperature problem`;
        case 'nutrients':
          return `🌱 Low soil nutrients`;
        case 'water_level':
          return `💧 Water level issue`;
        default:
          return `⚠️ Sensor alert`;
      }
    } else if (alertCount === 2) {
      // Two alerts - list both types with keywords
      const keywords = alerts.map(a => this.getAlertKeyword(a.type)).join(' + ');
      return `${keywords} - ${alertCount} issues`;
    } else {
      // Multiple alerts - use keywords for all alerts
      const allKeywords = alerts.map(a => this.getAlertKeyword(a.type)).join(' + ');
      const urgentCount = alerts.filter(a => a.level === 'urgent').length;
      
      if (urgentCount > 0) {
        return `${allKeywords} - ${alertCount} issues (${urgentCount} urgent)`;
      } else {
        return `${allKeywords} - ${alertCount} issues detected`;
      }
    }
  }

  /**
   * Get clear keyword for alert type
   */
  private getAlertKeyword(type: string): string {
    const keywords = {
      'watering': 'Moisture',
      'light': 'Light',
      'temperature': 'Temp',
      'nutrients': 'Nutrients',
      'water_level': 'Water Level',
    };
    return keywords[type] || 'Alert';
  }

  /**
   * Get emoji for alert type
   */
  private getAlertEmoji(type: string): string {
    const emojis = {
      'watering': '💧',
      'light': '💡',
      'temperature': '🌡️',
      'nutrients': '🌱',
      'water_level': '💧',
    };
    return emojis[type] || '⚠️';
  }

  /**
   * Create comprehensive advice based on all alerts
   */
  private createComprehensiveAdvice(alerts: Array<{ type: string; level: string; message: string }>): string {
    const advice = [];
    
    if (alerts.some(a => a.type === 'watering')) {
      advice.push('• Check soil moisture and water if needed');
    }
    
    if (alerts.some(a => a.type === 'light')) {
      advice.push('• Adjust plant position for optimal light exposure');
    }
    
    if (alerts.some(a => a.type === 'temperature')) {
      advice.push('• Move plant to a more suitable temperature environment');
    }
    
    if (alerts.some(a => a.type === 'nutrients')) {
      advice.push('• Consider adding fertilizer to improve soil nutrients');
    }
    
    if (alerts.some(a => a.type === 'water_level')) {
      advice.push('• Check water reservoir and drainage system');
    }
    
    return advice.join('\n') || 'Please check your plant\'s overall health and environment.';
  }

  /**
   * Get users associated with an object
   */
  private async getUsersForObject(objectId: number): Promise<{ users: any[], objectProfile: any }> {
    try {
      // First, find the object profile to get the associated user
      const objectProfile = await this.objectProfileService.findOne(objectId);
      this.logger.log(`🔍 Found object profile for ID ${objectId}: user ${objectProfile.idPerson}, object ${objectProfile.idObject}`);
      
      if (!objectProfile || !objectProfile.idPerson) {
        this.logger.warn(`⚠️ No user associated with object ${objectId}`);
        return { users: [], objectProfile: null };
      }
      
      // Get the specific user for this object
      const user = await this.personService.findOne(objectProfile.idPerson);
      if (!user) {
        this.logger.warn(`⚠️ User ${objectProfile.idPerson} not found for object ${objectId}`);
        return { users: [], objectProfile: null };
      }
      
      this.logger.log(`👤 Found user: ${user.email || user.idPerson} for object ${objectId}`);
      
      // Check if user has FCM token
      if (user.fcmToken) {
        this.logger.log(`📱 User has FCM token: ${user.fcmToken.substring(0, 20)}...`);
      } else {
        this.logger.warn(`⚠️ User ${user.idPerson} has no FCM token`);
      }
      
      return { users: [user], objectProfile };
    } catch (error) {
      this.logger.error(`❌ Error getting users for object ${objectId}: ${error.message}`);
      return { users: [], objectProfile: null };
    }
  }

  /**
   * Validate sensor data ranges
   */
  validateSensorData(data: SensorData): boolean {
    const validations = [
      { field: 'humidityAirSensor', min: 0, max: 100 },
      { field: 'humidityGroundSensor', min: 0, max: 4095 },
      { field: 'phGroundSensor', min: 0, max: 14 },
      { field: 'conductivityElectriqueFertilitySensor', min: 0, max: 1000 },
      { field: 'lightSensor', min: 0, max: 1 },
      { field: 'temperatureSensorGround', min: -40, max: 80 },
      { field: 'temperatureSensorExtern', min: -40, max: 80 },
      { field: 'expositionTimeSun', min: 0, max: 86400 },
      { field: 'water_sensor', min: 0, max: 700 },
    ];

    for (const validation of validations) {
      const value = data[validation.field as keyof SensorData];
      if (typeof value !== 'number' || value < validation.min || value > validation.max) {
        this.logger.warn(`⚠️ Invalid sensor data: ${validation.field} = ${value}`);
        return false;
      }
    }

    return true;
  }
} 