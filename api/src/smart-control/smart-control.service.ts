import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectProfile } from '../object-profile/entities/object-profile.entity';
import { PlantType } from '../plant-type/entities/plant-type.entity';

export interface SensorAnalysis {
  needsWatering: boolean;
  needsLighting: boolean;
  plantHealth: 'good' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}

export interface ControlCommands {
  isWillWatering: boolean;
  lightSensor: number; // 0 = off, 1 = on, 2 = health indicator mode
  healthIndicator: 'green' | 'yellow' | 'red';
  lastActionTime: Date;
}

@Injectable()
export class SmartControlService {
  constructor(
    @InjectRepository(ObjectProfile)
    private objectProfileRepository: Repository<ObjectProfile>,
    @InjectRepository(PlantType)
    private plantTypeRepository: Repository<PlantType>,
  ) {}

  /**
   * Main entry point - processes sensor data and determines control actions
   */
  async processSensorDataUpdate(objectProfileId: number): Promise<ControlCommands> {
    const analysis = await this.analyzeSensorData(objectProfileId);
    const commands = await this.generateControlCommands(objectProfileId, analysis);
    await this.updateObjectProfileCommands(objectProfileId, commands);
    await this.sendNotificationsIfNeeded(objectProfileId, analysis);
    
    return commands;
  }

  /**
   * Analyzes current sensor data against plant type requirements
   */
  async analyzeSensorData(objectProfileId: number): Promise<SensorAnalysis> {
    const objectProfile = await this.objectProfileRepository.findOne({
      where: { idObjectProfile: objectProfileId },
      relations: ['plantType'],
    });

    if (!objectProfile || !objectProfile.plantType) {
      throw new Error(`Object profile ${objectProfileId} or plant type not found`);
    }

    const plantType = objectProfile.plantType;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check soil humidity for watering
    const needsWatering = this.checkWateringConditions(objectProfile, plantType, issues, recommendations);
    
    // Check lighting conditions
    const needsLighting = this.checkLightingConditions(objectProfile, plantType, issues, recommendations);
    
    // Determine overall plant health
    const plantHealth = this.determinePlantHealth(objectProfile, plantType, issues);

    return {
      needsWatering,
      needsLighting,
      plantHealth,
      issues,
      recommendations,
    };
  }

  /**
   * Checks if watering is needed based on soil humidity and other factors
   */
  private checkWateringConditions(
    objectProfile: ObjectProfile,
    plantType: PlantType,
    issues: string[],
    recommendations: string[],
  ): boolean {
    const currentHumidity = objectProfile.humidityGroundSensor;
    const minHumidity = plantType.humidityGroundSensorMin;
    const maxHumidity = plantType.humidityGroundSensorMax;

    if (currentHumidity < minHumidity) {
      issues.push(`Soil humidity (${currentHumidity}%) is below minimum (${minHumidity}%)`);
      recommendations.push('Watering needed');
      return true;
    }

    if (currentHumidity > maxHumidity) {
      issues.push(`Soil humidity (${currentHumidity}%) is above maximum (${maxHumidity}%)`);
      recommendations.push('Reduce watering frequency');
      return false;
    }

    return false;
  }

  /**
   * Checks if lighting adjustments are needed
   */
  private checkLightingConditions(
    objectProfile: ObjectProfile,
    plantType: PlantType,
    issues: string[],
    recommendations: string[],
  ): boolean {
    const currentLight = objectProfile.lightSensor;
    const minLight = plantType.lightSensorMin;
    const maxLight = plantType.lightSensorMax;

    if (currentLight < minLight) {
      issues.push(`Light intensity (${currentLight}) is below minimum (${minLight})`);
      recommendations.push('Increase lighting');
      return true;
    }

    if (currentLight > maxLight) {
      issues.push(`Light intensity (${currentLight}) is above maximum (${maxLight})`);
      recommendations.push('Reduce lighting exposure');
      return false;
    }

    return false;
  }

  /**
   * Determines overall plant health based on all sensor readings
   */
  private determinePlantHealth(
    objectProfile: ObjectProfile,
    plantType: PlantType,
    issues: string[],
  ): 'good' | 'warning' | 'critical' {
    let criticalIssues = 0;
    let warningIssues = 0;

    // Check temperature
    if (objectProfile.temperatureSensorGround < plantType.temperatureSensorGroundMin ||
        objectProfile.temperatureSensorGround > plantType.temperatureSensorGroundMax) {
      criticalIssues++;
    }

    // Check pH
    if (objectProfile.phGroundSensor < plantType.phMin || 
        objectProfile.phGroundSensor > plantType.phMax) {
      warningIssues++;
    }

    // Check conductivity
    if (objectProfile.conductivityElectriqueFertilitySensor < plantType.conductivityElectriqueFertilityMin ||
        objectProfile.conductivityElectriqueFertilitySensor > plantType.conductivityElectriqueFertilityMax) {
      warningIssues++;
    }

    // Check air humidity
    if (objectProfile.humidityAirSensor < plantType.humidityAirSensorMin ||
        objectProfile.humidityAirSensor > plantType.humidityAirSensorMax) {
      warningIssues++;
    }

    if (criticalIssues > 0) return 'critical';
    if (warningIssues > 0 || issues.length > 0) return 'warning';
    return 'good';
  }

  /**
   * Generates control commands based on analysis
   */
  async generateControlCommands(
    objectProfileId: number,
    analysis: SensorAnalysis,
  ): Promise<ControlCommands> {
    const objectProfile = await this.objectProfileRepository.findOne({
      where: { idObjectProfile: objectProfileId },
    });

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

    // Determine lighting mode
    let lightSensor = 0; // off by default
    if (analysis.needsLighting) {
      lightSensor = 1; // turn on lights
    } else if (analysis.plantHealth !== 'good') {
      lightSensor = 2; // health indicator mode
    }

    return {
      isWillWatering: analysis.needsWatering,
      lightSensor,
      healthIndicator,
      lastActionTime: new Date(),
    };
  }

  /**
   * Updates the object profile with new control commands
   */
  async updateObjectProfileCommands(
    objectProfileId: number,
    commands: ControlCommands,
  ): Promise<void> {
    await this.objectProfileRepository.update(
      { idObjectProfile: objectProfileId },
      {
        isWillWatering: commands.isWillWatering,
        lightSensor: commands.lightSensor,
        lastWateringTime: commands.isWillWatering ? new Date() : undefined,
      },
    );
  }

  /**
   * Sends notifications if significant issues are detected
   */
  async sendNotificationsIfNeeded(
    objectProfileId: number,
    analysis: SensorAnalysis,
  ): Promise<void> {
    // Only send notifications for critical issues or when automatic actions are taken
    if (analysis.plantHealth === 'critical' || 
        analysis.needsWatering || 
        analysis.needsLighting) {
      
      // TODO: Integrate with notification service
      console.log(`Smart control actions for object ${objectProfileId}:`, {
        health: analysis.plantHealth,
        watering: analysis.needsWatering,
        lighting: analysis.needsLighting,
        issues: analysis.issues,
      });
    }
  }

  /**
   * Gets time since last watering action
   */
  async getTimeSinceLastWatering(objectProfileId: number): Promise<number> {
    const objectProfile = await this.objectProfileRepository.findOne({
      where: { idObjectProfile: objectProfileId },
      select: ['lastWateringTime'],
    });

    if (!objectProfile?.lastWateringTime) {
      return Infinity; // Never watered
    }

    return Date.now() - objectProfile.lastWateringTime.getTime();
  }

  /**
   * Validates sensor readings for reasonable values
   */
  validateSensorReadings(sensorData: any): boolean {
    const validRanges = {
      humidityGroundSensor: { min: 0, max: 100 },
      humidityAirSensor: { min: 0, max: 100 },
      temperatureSensorGround: { min: -10, max: 50 },
      temperatureSensorExtern: { min: -20, max: 60 },
      phGroundSensor: { min: 0, max: 14 },
      lightSensor: { min: 0, max: 10000 },
    };

    for (const [sensor, range] of Object.entries(validRanges)) {
      if (sensorData[sensor] !== undefined && 
          (sensorData[sensor] < range.min || sensorData[sensor] > range.max)) {
        return false;
      }
    }

    return true;
  }
} 