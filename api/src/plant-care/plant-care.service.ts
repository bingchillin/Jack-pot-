import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { NotificationLocalizationService } from '../notification/notification-localization.service';
import { PersonService } from '../person/person.service';
import { ObjectProfile } from '../object-profile/entities/object-profile.entity';
import { PlantType } from '../plant-type/entities/plant-type.entity';
import { PlantHealthCalculationService } from './plant-health-calculation.service';

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

export interface PlantAnalysis {
  needsWatering: boolean;
  needsLighting: boolean;
  plantHealth: 'good' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  alerts: Array<{ type: string; level: string; message: string }>;
}

export interface ControlCommands {
  isWillWatering: boolean;
  lightSensor: number; // 0 = off, 1 = green (good), 2 = yellow (warning), 3 = red (critical)
  healthIndicator: 'green' | 'yellow' | 'red';
  lastActionTime: Date;
}

export interface PlantCareResult {
  success: boolean;
  processedData: ProcessedSensorData;
  analysis: PlantAnalysis;
  controlCommands: ControlCommands;
  alertsSent: Array<{ type: string; level: string; message: string }>;
  timestamp: string;
  objectId: number;
  healthResult?: any; // Include health result in response
}

@Injectable()
export class PlantCareService {
  private readonly logger = new Logger(PlantCareService.name);

  constructor(
    @InjectRepository(ObjectProfile)
    private objectProfileRepository: Repository<ObjectProfile>,
    @InjectRepository(PlantType)
    private plantTypeRepository: Repository<PlantType>,
    private readonly notificationService: NotificationService,
    private readonly notificationLocalizationService: NotificationLocalizationService,
    private readonly personService: PersonService,
    private readonly plantHealthCalculationService: PlantHealthCalculationService,
  ) {}

  /**
   * Main entry point - unified plant care processing
   */
  async processPlantCare(objectId: number, rawData: SensorData): Promise<PlantCareResult> {
    try {
      this.logger.log(`🌱 Processing plant care for object ${objectId}`);

      // Validate sensor data
      if (!this.validateSensorData(rawData)) {
        throw new Error('Invalid sensor data received');
      }

      // Process raw sensor data
      const processedData = this.processRawSensorData(rawData, objectId);
      
      // Calculate plant health
      const healthResult = await this.plantHealthCalculationService.calculatePlantHealth(objectId, rawData);
      
      // Update plant health in database
      await this.updatePlantHealth(objectId, healthResult, rawData);
      
      // Analyze plant conditions
      const analysis = await this.analyzePlantConditions(objectId, processedData);
      
      // Generate control commands
      const controlCommands = await this.generateControlCommands(objectId, analysis);
      
      // Update database with commands
      await this.updateObjectProfileCommands(objectId, controlCommands);
      
      // Send notifications
      const alertsSent = await this.sendNotifications(objectId, processedData, analysis);

      this.logger.log(`✅ Plant care processed successfully - Health: ${healthResult.overallHealth}%, ${alertsSent.length} alerts sent`);

      return {
        success: true,
        processedData,
        analysis,
        controlCommands,
        alertsSent,
        timestamp: new Date().toISOString(),
        objectId,
        healthResult, // Include health result in response
      };
    } catch (error) {
      this.logger.error(`❌ Error processing plant care: ${error.message}`);
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
   */
  private processMoistureSensor(rawValue: number): number {
    const moisturePercentage = Math.max(0, Math.min(100, ((4095 - rawValue) / 4095) * 100));
    return Math.round(moisturePercentage * 10) / 10;
  }

  /**
   * Process light sensor (UV LED status)
   */
  private processLightSensor(rawValue: number): number {
    const lightLux = rawValue > 0 ? 800 : 200;
    return lightLux;
  }

  /**
   * Process temperature sensor
   */
  private processTemperatureSensor(rawValue: number): number {
    const temperature = Math.max(-40, Math.min(80, rawValue));
    return Math.round(temperature * 10) / 10;
  }

  /**
   * Process soil nutrient sensor
   */
  private processNutrientSensor(rawValue: number): number {
    const nutrientPercentage = Math.max(0, Math.min(100, rawValue));
    return Math.round(nutrientPercentage * 10) / 10;
  }

  /**
   * Process air humidity sensor
   */
  private processAirHumiditySensor(rawValue: number): number {
    const humidity = Math.max(0, Math.min(100, rawValue));
    return Math.round(humidity * 10) / 10;
  }

  /**
   * Process water level sensor
   */
  private processWaterSensor(rawValue: number): number {
    const waterPercentage = Math.max(0, Math.min(100, (rawValue / 700) * 100));
    return Math.round(waterPercentage * 10) / 10;
  }

  /**
   * Analyze plant conditions using plant type thresholds
   */
  async analyzePlantConditions(objectId: number, processedData: ProcessedSensorData): Promise<PlantAnalysis> {
    const objectProfile = await this.objectProfileRepository.findOne({
      where: { idObjectProfile: objectId },
      relations: ['plantType'],
    });

    if (!objectProfile || !objectProfile.plantType) {
      throw new Error(`Object profile ${objectId} or plant type not found`);
    }

    const plantType = objectProfile.plantType;
    const issues: string[] = [];
    const recommendations: string[] = [];
    const alerts: Array<{ type: string; level: string; message: string }> = [];

    // Check watering conditions
    const needsWatering = this.checkWateringConditions(processedData, plantType, issues, recommendations, alerts);
    
    // Check lighting conditions
    const needsLighting = this.checkLightingConditions(processedData, plantType, issues, recommendations, alerts);
    
    // Check other conditions
    this.checkTemperatureConditions(processedData, plantType, issues, recommendations, alerts);
    this.checkNutrientConditions(processedData, plantType, issues, recommendations, alerts);
    this.checkWaterLevelConditions(processedData, issues, recommendations, alerts);
    
    // Determine overall plant health
    const plantHealth = this.determinePlantHealth(processedData, plantType, issues);

    return {
      needsWatering,
      needsLighting,
      plantHealth,
      issues,
      recommendations,
      alerts,
    };
  }

  /**
   * Check watering conditions using plant type thresholds
   */
  private checkWateringConditions(
    processedData: ProcessedSensorData,
    plantType: PlantType,
    issues: string[],
    recommendations: string[],
    alerts: Array<{ type: string; level: string; message: string }>,
  ): boolean {
    const currentHumidity = processedData.moisture;
    const minHumidity = plantType.humidityGroundSensorMin || 20; // Default if not set
    const maxHumidity = plantType.humidityGroundSensorMax || 80;

    if (currentHumidity < minHumidity) {
      const level = currentHumidity < 10 ? 'urgent' : 'normal';
      issues.push(`Soil humidity (${currentHumidity}%) is below minimum (${minHumidity}%)`);
      recommendations.push('Watering needed');
      alerts.push({
        type: 'watering',
        level,
        message: `My Plant needs ${level === 'urgent' ? 'immediate' : ''} watering! ${level === 'urgent' ? '🚨' : '💧'}`,
      });
      return true;
    }

    if (currentHumidity > maxHumidity) {
      issues.push(`Soil humidity (${currentHumidity}%) is above maximum (${maxHumidity}%)`);
      recommendations.push('Reduce watering frequency');
      alerts.push({
        type: 'watering',
        level: 'normal',
        message: 'My Plant is overwatered! 💧',
      });
      return false;
    }

    return false;
  }

  /**
   * Check lighting conditions
   */
  private checkLightingConditions(
    processedData: ProcessedSensorData,
    plantType: PlantType,
    issues: string[],
    recommendations: string[],
    alerts: Array<{ type: string; level: string; message: string }>,
  ): boolean {
    const currentLight = processedData.light;
    const minLight = plantType.lightSensorMin || 200;
    const maxLight = plantType.lightSensorMax || 5000;

    if (currentLight < minLight) {
      issues.push(`Light intensity (${currentLight}) is below minimum (${minLight})`);
      recommendations.push('Increase lighting');
      alerts.push({
        type: 'light',
        level: 'normal',
        message: 'My Plant needs more light 💡',
      });
      return true;
    }

    if (currentLight > maxLight) {
      issues.push(`Light intensity (${currentLight}) is above maximum (${maxLight})`);
      recommendations.push('Reduce lighting exposure');
      alerts.push({
        type: 'light',
        level: 'normal',
        message: 'My Plant is getting too much light! ☀️',
      });
      return false;
    }

    return false;
  }

  /**
   * Check temperature conditions
   */
  private checkTemperatureConditions(
    processedData: ProcessedSensorData,
    plantType: PlantType,
    issues: string[],
    recommendations: string[],
    alerts: Array<{ type: string; level: string; message: string }>,
  ): void {
    const currentTemp = processedData.temperature;
    const minTemp = plantType.temperatureSensorGroundMin || 15;
    const maxTemp = plantType.temperatureSensorGroundMax || 30;

    if (currentTemp < minTemp) {
      issues.push(`Temperature (${currentTemp}°C) is below minimum (${minTemp}°C)`);
      recommendations.push('Move to warmer location');
      alerts.push({
        type: 'temperature',
        level: 'normal',
        message: 'My Plant is too cold! 🌡️',
      });
    } else if (currentTemp > maxTemp) {
      issues.push(`Temperature (${currentTemp}°C) is above maximum (${maxTemp}°C)`);
      recommendations.push('Move to cooler location');
      alerts.push({
        type: 'temperature',
        level: 'normal',
        message: 'My Plant is too hot! 🌡️',
      });
    }
  }

  /**
   * Check nutrient conditions
   */
  private checkNutrientConditions(
    processedData: ProcessedSensorData,
    plantType: PlantType,
    issues: string[],
    recommendations: string[],
    alerts: Array<{ type: string; level: string; message: string }>,
  ): void {
    const currentNutrients = processedData.soilNutrients;
    const minNutrients = plantType.conductivityElectriqueFertilityMin || 10;
    const maxNutrients = plantType.conductivityElectriqueFertilityMax || 90;

    if (currentNutrients < minNutrients) {
      issues.push(`Soil nutrients (${currentNutrients}%) are below minimum (${minNutrients}%)`);
      recommendations.push('Add fertilizer');
      alerts.push({
        type: 'nutrients',
        level: 'normal',
        message: 'My Plant needs fertilizer 🌱',
      });
    } else if (currentNutrients > maxNutrients) {
      issues.push(`Soil nutrients (${currentNutrients}%) are above maximum (${maxNutrients}%)`);
      recommendations.push('Reduce fertilizer');
    }
  }

  /**
   * Check water level conditions
   */
  private checkWaterLevelConditions(
    processedData: ProcessedSensorData,
    issues: string[],
    recommendations: string[],
    alerts: Array<{ type: string; level: string; message: string }>,
  ): void {
    const waterLevel = processedData.waterLevel;

    if (waterLevel > 90) {
      issues.push(`Water level (${waterLevel}%) is too high`);
      recommendations.push('Check for drainage issues');
      alerts.push({
        type: 'water_level',
        level: 'normal',
        message: 'My Plant water level is too high! 💧',
      });
    }
  }

  /**
   * Determine overall plant health
   */
  private determinePlantHealth(
    processedData: ProcessedSensorData,
    plantType: PlantType,
    issues: string[],
  ): 'good' | 'warning' | 'critical' {
    let criticalIssues = 0;
    let warningIssues = 0;

    // Check temperature (critical)
    const minTemp = plantType.temperatureSensorGroundMin || 15;
    const maxTemp = plantType.temperatureSensorGroundMax || 30;
    if (processedData.temperature < minTemp || processedData.temperature > maxTemp) {
      criticalIssues++;
    }

    // Check moisture (critical)
    const minMoisture = plantType.humidityGroundSensorMin || 20;
    if (processedData.moisture < minMoisture) {
      criticalIssues++;
    }

    // Check pH (warning)
    const minPh = plantType.phMin || 5.5;
    const maxPh = plantType.phMax || 7.5;
    if (processedData.soilNutrients < minPh || processedData.soilNutrients > maxPh) {
      warningIssues++;
    }

    if (criticalIssues > 0) return 'critical';
    if (warningIssues > 0 || issues.length > 0) return 'warning';
    return 'good';
  }

  /**
   * Generate control commands based on analysis
   */
  async generateControlCommands(
    objectId: number,
    analysis: PlantAnalysis,
  ): Promise<ControlCommands> {
    // Determine health indicator color
    let healthIndicator: 'green' | 'yellow' | 'red';
    switch (analysis.plantHealth) {
      case 'good':
        healthIndicator = 'green';
        break;
      case 'warning':
        healthIndicator = 'yellow';
        break;
      case 'critical':
        healthIndicator = 'red';
        break;
    }

    // Determine lighting mode based on health
    let lightSensor = 0; // off by default
    switch (healthIndicator) {
      case 'green':
        lightSensor = 1; // green light
        break;
      case 'yellow':
        lightSensor = 2; // yellow light
        break;
      case 'red':
        lightSensor = 3; // red light
        break;
    }

    return {
      isWillWatering: analysis.needsWatering,
      lightSensor,
      healthIndicator,
      lastActionTime: new Date(),
    };
  }

  /**
   * Update object profile with control commands
   */
  async updateObjectProfileCommands(
    objectId: number,
    commands: ControlCommands,
  ): Promise<void> {
    await this.objectProfileRepository.update(
      { idObjectProfile: objectId },
      {
        isWillWatering: commands.isWillWatering,
        lightSensor: commands.lightSensor,
        lastWateringTime: commands.isWillWatering ? new Date() : undefined,
      },
    );
  }

  /**
   * Update plant health in database
   */
  async updatePlantHealth(objectId: number, healthResult: any, rawSensorData: SensorData): Promise<void> {
    await this.objectProfileRepository.update(
      { idObjectProfile: objectId },
      {
        healthPercentage: healthResult.overallHealth,
        state: healthResult.state, // Update state for backward compatibility
        // Store the latest sensor data
        humidityAirSensor: rawSensorData.humidityAirSensor,
        humidityGroundSensor: rawSensorData.humidityGroundSensor,
        phGroundSensor: rawSensorData.phGroundSensor,
        conductivityElectriqueFertilitySensor: rawSensorData.conductivityElectriqueFertilitySensor,
        lightSensor: rawSensorData.lightSensor,
        temperatureSensorGround: rawSensorData.temperatureSensorGround,
        temperatureSensorExtern: rawSensorData.temperatureSensorExtern,
        expositionTimeSun: rawSensorData.expositionTimeSun,
        water_sensor: rawSensorData.water_sensor,
        updatedAt: new Date(),
      },
    );
    
    this.logger.log(`🏥 Updated plant health and sensor data for object ${objectId}: ${healthResult.overallHealth}% (state: ${healthResult.state})`);
  }

  /**
   * Send notifications to users
   */
  async sendNotifications(
    objectId: number,
    processedData: ProcessedSensorData,
    analysis: PlantAnalysis,
  ): Promise<Array<{ type: string; level: string; message: string }>> {
    if (analysis.alerts.length === 0) {
      return [];
    }

    try {
      // Get users associated with this object
      const { users, objectProfile } = await this.getUsersForObject(objectId);
      
      if (users.length === 0) {
        this.logger.warn(`⚠️ No users found for object ${objectId}`);
        return analysis.alerts;
      }

      const correctObjectId = objectProfile?.idObject || objectId;

      // Send notifications to all users
      for (const user of users) {
        try {
          const userLocale = user.preferredLanguage || 'en';
          const alertLevel = this.determineOverallAlertLevel(analysis.alerts);
          
          const localizedContent = this.createLocalizedNotificationContent(
            userLocale,
            processedData.plantName,
            analysis.alerts
          );
          
          await this.notificationService.createPlantCareNotification(
            user.idPerson,
            correctObjectId,
            localizedContent.title,
            localizedContent.body,
            localizedContent.advice,
            processedData.plantName,
            'sensor_consolidated',
            alertLevel,
          );
          
          this.logger.log(`✅ Notification sent to user ${user.idPerson} (${userLocale})`);
        } catch (error) {
          this.logger.error(`❌ Failed to send notification to user ${user.idPerson}: ${error.message}`);
        }
      }

      return analysis.alerts;
    } catch (error) {
      this.logger.error(`❌ Error sending notifications: ${error.message}`);
      return analysis.alerts;
    }
  }

  /**
   * Get users associated with an object
   */
  private async getUsersForObject(objectId: number): Promise<{ users: any[], objectProfile: any }> {
    const objectProfile = await this.objectProfileRepository.findOne({
      where: { idObjectProfile: objectId },
      relations: ['person'],
    });

    if (!objectProfile?.person) {
      return { users: [], objectProfile };
    }

    const users = [objectProfile.person];
    return { users, objectProfile };
  }

  /**
   * Determine overall alert level
   */
  private determineOverallAlertLevel(alerts: Array<{ type: string; level: string; message: string }>): 'low' | 'medium' | 'high' | 'critical' {
    if (alerts.some(alert => alert.level === 'urgent')) return 'critical';
    if (alerts.some(alert => alert.level === 'high')) return 'high';
    if (alerts.some(alert => alert.level === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Create localized notification content
   */
  private createLocalizedNotificationContent(
    locale: string,
    plantName: string,
    alerts: Array<{ type: string; level: string; message: string }>
  ): { title: string; body: string; advice: string } {
    const alertCount = alerts.length;
    const urgentCount = alerts.filter(a => a.level === 'urgent').length;
    
    let title: string;
    if (urgentCount > 0) {
      title = `🚨 ${plantName} - Urgent!`;
    } else if (alertCount > 2) {
      title = `⚠️ ${plantName} - ${alertCount} issues`;
    } else {
      title = `🌱 ${plantName} - Needs care`;
    }
    
    const body = this.createShortDescription(alerts, plantName);
    const advice = this.createComprehensiveAdvice(alerts);
    
    return { title, body, advice };
  }

  /**
   * Create short description for notifications
   */
  private createShortDescription(
    alerts: Array<{ type: string; level: string; message: string }>,
    plantName: string
  ): string {
    const alertCount = alerts.length;
    
    if (alertCount === 1) {
      const alert = alerts[0];
      switch (alert.type) {
        case 'watering':
          return alert.level === 'urgent' ? `💧 Needs water urgently!` : `💧 Time to water`;
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
      const keywords = alerts.map(a => this.getAlertKeyword(a.type)).join(' + ');
      return `⚠️ ${keywords} issues`;
    } else {
      return `⚠️ ${alertCount} plant care issues`;
    }
  }

  /**
   * Create comprehensive advice
   */
  private createComprehensiveAdvice(alerts: Array<{ type: string; level: string; message: string }>): string {
    const advice = alerts.map(alert => {
      switch (alert.type) {
        case 'watering':
          return alert.level === 'urgent' 
            ? '🚨 Water immediately to prevent plant damage'
            : '💧 Water your plant soon to maintain health';
        case 'light':
          return '💡 Adjust lighting - move to brighter or shadier location';
        case 'temperature':
          return '🌡️ Move plant to better temperature environment';
        case 'nutrients':
          return '🌱 Add fertilizer to improve soil nutrients';
        case 'water_level':
          return '💧 Check drainage and reduce watering frequency';
        default:
          return '⚠️ Monitor plant conditions closely';
      }
    }).join('\n\n');
    
    return advice || 'Your plant is healthy! 🌱';
  }

  /**
   * Get alert keyword
   */
  private getAlertKeyword(type: string): string {
    switch (type) {
      case 'watering': return 'Watering';
      case 'light': return 'Light';
      case 'temperature': return 'Temperature';
      case 'nutrients': return 'Nutrients';
      case 'water_level': return 'Water Level';
      default: return 'Care';
    }
  }

  /**
   * Validate sensor data
   */
  validateSensorData(data: SensorData): boolean {
    const validRanges = {
      humidityAirSensor: { min: 0, max: 100 },
      humidityGroundSensor: { min: 0, max: 4095 },
      temperatureSensorGround: { min: -10, max: 50 },
      temperatureSensorExtern: { min: -20, max: 60 },
      phGroundSensor: { min: 0, max: 14 },
      lightSensor: { min: 0, max: 1 },
      water_sensor: { min: 0, max: 700 },
    };

    for (const [sensor, range] of Object.entries(validRanges)) {
      if (data[sensor] !== undefined && 
          (data[sensor] < range.min || data[sensor] > range.max)) {
        return false;
      }
    }

    return true;
  }
} 