import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectProfile } from '../object-profile/entities/object-profile.entity';
import { PlantType } from '../plant-type/entities/plant-type.entity';

export interface SensorHealthScore {
  sensor: string;
  currentValue: number;
  optimalMin: number;
  optimalMax: number;
  score: number; // 0-100
  status: 'perfect' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface PlantHealthResult {
  overallHealth: number; // 0-100
  state: number; // 0-5 (for backward compatibility)
  sensorScores: SensorHealthScore[];
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: string[];
  lastUpdated: Date;
}

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
}

@Injectable()
export class PlantHealthCalculationService {
  private readonly logger = new Logger(PlantHealthCalculationService.name);

  constructor(
    @InjectRepository(ObjectProfile)
    private objectProfileRepository: Repository<ObjectProfile>,
    @InjectRepository(PlantType)
    private plantTypeRepository: Repository<PlantType>,
  ) {}

  /**
   * Calculate plant health based on current sensor data and plant type requirements
   */
  async calculatePlantHealth(objectId: number, rawSensorData: SensorData): Promise<PlantHealthResult> {
    try {
      // Get plant profile with plant type
      const objectProfile = await this.objectProfileRepository.findOne({
        where: { idObjectProfile: objectId },
        relations: ['plantType'],
      });

      if (!objectProfile || !objectProfile.plantType) {
        throw new Error(`Object profile ${objectId} or plant type not found`);
      }

      const plantType = objectProfile.plantType;
      
      // Log plant type information
      this.logger.log(`🌱 Plant type for object ${objectId}: ${plantType.title} (ID: ${plantType.idPlantType})`);
      this.logger.log(`📋 Plant type requirements:`, {
        humidityGroundSensorMin: plantType.humidityGroundSensorMin,
        humidityGroundSensorMax: plantType.humidityGroundSensorMax,
        temperatureSensorGroundMin: plantType.temperatureSensorGroundMin,
        temperatureSensorGroundMax: plantType.temperatureSensorGroundMax,
        lightSensorMin: plantType.lightSensorMin,
        lightSensorMax: plantType.lightSensorMax,
        phMin: plantType.phMin,
        phMax: plantType.phMax,
      });
      
      // Process raw sensor data to match the same processing as PlantCareService
      const processedData = this.processRawSensorData(rawSensorData);
      
      // Log processed sensor data
      this.logger.log(`📊 Raw sensor data for object ${objectId}:`, rawSensorData);
      this.logger.log(`🔧 Processed sensor data for object ${objectId}:`, processedData);
      
      // Log plant type requirements for debugging
      this.logger.log(`🌱 Plant type requirements for ${plantType.title}:`, {
        humidityGroundSensorMin: plantType.humidityGroundSensorMin,
        humidityGroundSensorMax: plantType.humidityGroundSensorMax,
        temperatureSensorGroundMin: plantType.temperatureSensorGroundMin,
        temperatureSensorGroundMax: plantType.temperatureSensorGroundMax,
        lightSensorMin: plantType.lightSensorMin,
        lightSensorMax: plantType.lightSensorMax,
        phMin: plantType.phMin,
        phMax: plantType.phMax,
      });
      
      const sensorScores: SensorHealthScore[] = [];
      const recommendations: string[] = [];

      // Calculate health scores for each sensor using processed data
      const moistureScore = this.calculateSensorHealth(
        'moisture',
        processedData.moisture,
        plantType.humidityGroundSensorMin,
        plantType.humidityGroundSensorMax,
        'Soil moisture',
        '%'
      );
      sensorScores.push(moistureScore);
      this.logger.log(`💧 Moisture score: ${moistureScore.score}% (${moistureScore.status}) - Raw: ${rawSensorData.humidityGroundSensor}, Processed: ${processedData.moisture}%, Optimal: ${moistureScore.optimalMin}-${moistureScore.optimalMax}%`);

      const temperatureScore = this.calculateTemperatureHealth(
        processedData.temperature,
        rawSensorData.temperatureSensorExtern, // Use processed ground temp, raw external temp
        plantType.temperatureSensorGroundMin,
        plantType.temperatureSensorGroundMax,
        plantType.temperatureSensorExternMin,
        plantType.temperatureSensorExternMax
      );
      sensorScores.push(temperatureScore);
      this.logger.log(`🌡️ Temperature score: ${temperatureScore.score}% (${temperatureScore.status}) - Ground: ${processedData.temperature}°C, External: ${rawSensorData.temperatureSensorExtern}°C, Optimal: ${temperatureScore.optimalMin}-${temperatureScore.optimalMax}°C`);

      const lightScore = this.calculateSensorHealth(
        'light',
        processedData.light,
        plantType.lightSensorMin,
        plantType.lightSensorMax,
        'Light exposure',
        'lux'
      );
      sensorScores.push(lightScore);
      this.logger.log(`☀️ Light score: ${lightScore.score}% (${lightScore.status}) - Raw: ${rawSensorData.lightSensor}, Processed: ${processedData.light} lux, Optimal: ${lightScore.optimalMin}-${lightScore.optimalMax} lux`);

      const phScore = this.calculateSensorHealth(
        'ph',
        rawSensorData.phGroundSensor, // pH doesn't need processing
        plantType.phMin,
        plantType.phMax,
        'Soil pH',
        ''
      );
      sensorScores.push(phScore);
      this.logger.log(`🧪 pH score: ${phScore.score}% (${phScore.status}) - Value: ${rawSensorData.phGroundSensor}, Optimal: ${phScore.optimalMin}-${phScore.optimalMax}`);

      const airHumidityScore = this.calculateSensorHealth(
        'air_humidity',
        processedData.airHumidity,
        plantType.humidityAirSensorMin,
        plantType.humidityAirSensorMax,
        'Air humidity',
        '%'
      );
      sensorScores.push(airHumidityScore);
      this.logger.log(`💨 Air humidity score: ${airHumidityScore.score}% (${airHumidityScore.status}) - Raw: ${rawSensorData.humidityAirSensor}, Processed: ${processedData.airHumidity}%, Optimal: ${airHumidityScore.optimalMin}-${airHumidityScore.optimalMax}%`);

      const conductivityScore = this.calculateSensorHealth(
        'conductivity',
        rawSensorData.conductivityElectriqueFertilitySensor, // Conductivity doesn't need processing
        plantType.conductivityElectriqueFertilityMin,
        plantType.conductivityElectriqueFertilityMax,
        'Soil fertility',
        'µS/cm'
      );
      sensorScores.push(conductivityScore);
      this.logger.log(`🌱 Conductivity score: ${conductivityScore.score}% (${conductivityScore.status}) - Value: ${rawSensorData.conductivityElectriqueFertilitySensor}, Optimal: ${conductivityScore.optimalMin}-${conductivityScore.optimalMax} µS/cm`);

      // Calculate overall health (weighted average)
      const overallHealth = this.calculateOverallHealth(sensorScores);
      this.logger.log(`🏥 Overall health calculation: ${overallHealth.toFixed(1)}%`);

      // Generate recommendations
      this.generateRecommendations(sensorScores, recommendations);

      // Map health percentage to state (0-5) for backward compatibility
      const state = this.mapHealthToState(overallHealth);

      // Determine status
      const status = this.determineHealthStatus(overallHealth);

      this.logger.log(`🏥 Health calculation for object ${objectId}: ${overallHealth.toFixed(1)}% (${status})`);
      
      // Log detailed sensor analysis
      this.logger.log(`📊 Detailed sensor analysis for object ${objectId}:`);
      for (const score of sensorScores) {
        this.logger.log(`   ${score.sensor}: ${score.currentValue} (optimal: ${score.optimalMin}-${score.optimalMax}) -> ${score.score}% (${score.status})`);
      }
      this.logger.log(`   Overall health: ${overallHealth.toFixed(1)}% (${status})`);
      this.logger.log(`   Recommendations: ${recommendations.join(', ')}`);

      return {
        overallHealth: Math.round(overallHealth * 10) / 10, // Round to 1 decimal
        state,
        sensorScores,
        status,
        recommendations,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error calculating plant health for object ${objectId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Manually trigger health calculation for testing (uses current sensor data from database)
   */
  async recalculateHealthFromDatabase(objectId: number): Promise<PlantHealthResult> {
    try {
      // Get current object profile with sensor data
      const objectProfile = await this.objectProfileRepository.findOne({
        where: { idObjectProfile: objectId },
        relations: ['plantType'],
      });

      if (!objectProfile || !objectProfile.plantType) {
        throw new Error(`Object profile ${objectId} or plant type not found`);
      }

      // Create sensor data from current database values
      const sensorData: SensorData = {
        humidityAirSensor: objectProfile.humidityAirSensor || 0,
        humidityGroundSensor: objectProfile.humidityGroundSensor || 0,
        phGroundSensor: objectProfile.phGroundSensor || 0,
        conductivityElectriqueFertilitySensor: objectProfile.conductivityElectriqueFertilitySensor || 0,
        lightSensor: objectProfile.lightSensor || 0,
        temperatureSensorGround: objectProfile.temperatureSensorGround || 0,
        temperatureSensorExtern: objectProfile.temperatureSensorExtern || 0,
        expositionTimeSun: objectProfile.expositionTimeSun || 0,
        water_sensor: objectProfile.water_sensor || 0,
      };

      this.logger.log(`🔄 Manual health recalculation for object ${objectId} with current sensor data:`, sensorData);

      // Calculate health using current sensor data
      const healthResult = await this.calculatePlantHealth(objectId, sensorData);
      
      this.logger.log(`🔍 Health calculation result for object ${objectId}:`, {
        overallHealth: healthResult.overallHealth,
        state: healthResult.state,
        sensorScores: healthResult.sensorScores.map(score => ({
          sensor: score.sensor,
          currentValue: score.currentValue,
          optimalRange: `${score.optimalMin}-${score.optimalMax}`,
          score: score.score,
          status: score.status
        }))
      });

      // Update the database with new health calculation
      await this.objectProfileRepository.update(
        { idObjectProfile: objectId },
        {
          healthPercentage: healthResult.overallHealth,
          state: healthResult.state,
          updatedAt: new Date(),
        },
      );

      this.logger.log(`✅ Manual health recalculation completed for object ${objectId}: ${healthResult.overallHealth}%`);

      return healthResult;
    } catch (error) {
      this.logger.error(`Error in manual health recalculation for object ${objectId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process raw sensor data to match PlantCareService processing
   */
  private processRawSensorData(rawData: SensorData): ProcessedSensorData {
    return {
      moisture: this.processMoistureSensor(rawData.humidityGroundSensor),
      light: this.processLightSensor(rawData.lightSensor),
      temperature: this.processTemperatureSensor(rawData.temperatureSensorGround),
      soilNutrients: this.processNutrientSensor(rawData.conductivityElectriqueFertilitySensor),
      airHumidity: this.processAirHumiditySensor(rawData.humidityAirSensor),
      waterLevel: this.processWaterSensor(rawData.water_sensor),
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
    // Process to lux (200-800 range)
    const lightLux = rawValue > 0 ? 800 : 200;
    
    // Scale to match database requirements (which seem to be in a different unit)
    // Database values are around 60,000-100,000, so we'll scale up by ~100x
    const scaledLight = lightLux * 100;
    
    return scaledLight;
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
   * Calculate health score for a single sensor
   */
  private calculateSensorHealth(
    sensorName: string,
    currentValue: number,
    optimalMin: number | null,
    optimalMax: number | null,
    displayName: string,
    unit: string
  ): SensorHealthScore {
    // Use default ranges if plant type doesn't have specific requirements
    const min = optimalMin ?? this.getDefaultMin(sensorName);
    const max = optimalMax ?? this.getDefaultMax(sensorName);

    let score: number;
    let status: 'perfect' | 'good' | 'fair' | 'poor' | 'critical';

    // Special handling for conductivity when it's 0 (no nutrients)
    if (sensorName === 'conductivity' && Number(currentValue) === 0) {
      score = 0;
      status = 'critical';
    } else if (sensorName === 'ph' && Number(currentValue) === 0) {
      // pH of 0 is impossible and indicates sensor error
      score = 0;
      status = 'critical';
    } else if (currentValue >= min && currentValue <= max) {
      // Perfect - within optimal range
      score = 100;
      status = 'perfect';
    } else {
      // Calculate distance from optimal range
      const range = max - min;
      let distance: number;

      if (currentValue < min) {
        distance = min - currentValue;
      } else {
        distance = currentValue - max;
      }

      // Calculate tolerance zones
      const perfectZone = range * 0.1; // 10% of range
      const goodZone = range * 0.3;    // 30% of range
      const fairZone = range * 0.6;    // 60% of range
      const poorZone = range * 1.0;    // 100% of range

      if (distance <= perfectZone) {
        score = 90;
        status = 'perfect';
      } else if (distance <= goodZone) {
        score = 75;
        status = 'good';
      } else if (distance <= fairZone) {
        score = 50;
        status = 'fair';
      } else if (distance <= poorZone) {
        score = 25;
        status = 'poor';
      } else {
        score = 0;
        status = 'critical';
      }
    }

    // Debug logging for sensor values
    this.logger.debug(`${displayName}: ${currentValue}${unit} (optimal: ${min}-${max}${unit}) -> ${score}% (${status})`);

    return {
      sensor: sensorName,
      currentValue,
      optimalMin: min,
      optimalMax: max,
      score,
      status,
    };
  }

  /**
   * Calculate temperature health (combines ground and external temperature)
   */
  private calculateTemperatureHealth(
    groundTemp: number,
    externalTemp: number,
    groundMin: number | null,
    groundMax: number | null,
    externalMin: number | null,
    externalMax: number | null
  ): SensorHealthScore {
    // Calculate ground temperature score (using processed ground temp)
    const groundScore = this.calculateSensorHealth(
      'temperature_ground',
      groundTemp,
      groundMin,
      groundMax,
      'Ground temperature',
      '°C'
    );

    // Calculate external temperature score (using raw external temp - no processing needed)
    const externalScore = this.calculateSensorHealth(
      'temperature_external',
      externalTemp,
      externalMin,
      externalMax,
      'Air temperature',
      '°C'
    );

    // Average the two scores
    const averageScore = (groundScore.score + externalScore.score) / 2;
    const status = this.getStatusFromScore(averageScore);

    return {
      sensor: 'temperature',
      currentValue: (groundTemp + externalTemp) / 2,
      optimalMin: groundMin ?? this.getDefaultMin('temperature'),
      optimalMax: groundMax ?? this.getDefaultMax('temperature'),
      score: averageScore,
      status,
    };
  }

  /**
   * Calculate overall health from sensor scores
   */
  private calculateOverallHealth(sensorScores: SensorHealthScore[]): number {
    // Weight the sensors (core sensors have higher weight)
    const weights = {
      moisture: 0.25,      // 25% - most critical
      temperature: 0.20,   // 20%
      light: 0.20,         // 20%
      ph: 0.15,            // 15%
      air_humidity: 0.10,  // 10%
      conductivity: 0.10,  // 10%
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const score of sensorScores) {
      const weight = weights[score.sensor] || 0.1; // Default weight for unknown sensors
      totalWeightedScore += score.score * weight;
      totalWeight += weight;
    }

    return totalWeightedScore / totalWeight;
  }

  /**
   * Generate recommendations based on sensor scores
   */
  private generateRecommendations(sensorScores: SensorHealthScore[], recommendations: string[]): void {
    for (const score of sensorScores) {
      if (score.status === 'critical' || score.status === 'poor') {
        switch (score.sensor) {
          case 'moisture':
            if (score.currentValue < score.optimalMin) {
              recommendations.push('Water your plant immediately - soil is too dry');
            } else {
              recommendations.push('Reduce watering - soil is too wet');
            }
            break;
          case 'temperature':
            if (score.currentValue < score.optimalMin) {
              recommendations.push('Move plant to a warmer location');
            } else {
              recommendations.push('Move plant to a cooler location');
            }
            break;
          case 'light':
            if (score.currentValue < score.optimalMin) {
              recommendations.push('Move plant to a brighter location');
            } else {
              recommendations.push('Move plant to a shadier location');
            }
            break;
          case 'ph':
            recommendations.push('Check soil pH and adjust if necessary');
            break;
          case 'air_humidity':
            if (score.currentValue < score.optimalMin) {
              recommendations.push('Increase air humidity around the plant');
            } else {
              recommendations.push('Improve air circulation around the plant');
            }
            break;
          case 'conductivity':
            if (score.currentValue < score.optimalMin) {
              recommendations.push('Add fertilizer to improve soil fertility');
            } else {
              recommendations.push('Reduce fertilizer - soil is too rich');
            }
            break;
        }
      }
    }
  }

  /**
   * Map health percentage to state (0-5) for backward compatibility
   */
  private mapHealthToState(healthPercentage: number): number {
    if (healthPercentage >= 95) return 0; // Perfect
    if (healthPercentage >= 85) return 1; // Excellent
    if (healthPercentage >= 70) return 2; // Good
    if (healthPercentage >= 50) return 3; // Fair
    if (healthPercentage >= 30) return 4; // Needs Attention
    return 5; // Critical
  }

  /**
   * Determine health status from percentage
   */
  private determineHealthStatus(healthPercentage: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (healthPercentage >= 90) return 'excellent';
    if (healthPercentage >= 70) return 'good';
    if (healthPercentage >= 50) return 'fair';
    if (healthPercentage >= 30) return 'poor';
    return 'critical';
  }

  /**
   * Get status from score
   */
  private getStatusFromScore(score: number): 'perfect' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'perfect';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 30) return 'poor';
    return 'critical';
  }

  /**
   * Get default minimum values for sensors
   */
  private getDefaultMin(sensorName: string): number {
    const defaults = {
      moisture: 40,
      temperature: 15,
      light: 50000, // Updated to match database scale
      ph: 5.5,
      air_humidity: 30,
      conductivity: 300,
    };
    return defaults[sensorName] || 0;
  }

  /**
   * Get default maximum values for sensors
   */
  private getDefaultMax(sensorName: string): number {
    const defaults = {
      moisture: 80,
      temperature: 30,
      light: 100000, // Updated to match database scale
      ph: 7.5,
      air_humidity: 80,
      conductivity: 1500,
    };
    return defaults[sensorName] || 100;
  }
} 