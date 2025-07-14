import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PlantCareScore } from './entities/plant-care-score.entity';
import { CreatePlantCareScoreDto } from './dto/create-plant-care-score.dto';

@Injectable()
export class PlantCareScoreService {
  constructor(
    @InjectRepository(PlantCareScore)
    private plantCareScoreRepository: Repository<PlantCareScore>,
  ) {}

  async create(createPlantCareScoreDto: CreatePlantCareScoreDto): Promise<PlantCareScore> {
    const plantCareScore = this.plantCareScoreRepository.create(createPlantCareScoreDto);
    return await this.plantCareScoreRepository.save(plantCareScore);
  }

  async findByPlantAndDate(idObjectProfile: number, date: Date): Promise<PlantCareScore | null> {
    return await this.plantCareScoreRepository.findOne({
      where: {
        idObjectProfile,
        scoreDate: date,
      },
    });
  }

  async findByPlantAndDateRange(idObjectProfile: number, startDate: Date, endDate: Date): Promise<PlantCareScore[]> {
    return await this.plantCareScoreRepository.find({
      where: {
        idObjectProfile,
        scoreDate: Between(startDate, endDate),
      },
      order: {
        scoreDate: 'ASC',
      },
    });
  }

  async getWeeklyScores(idObjectProfile: number, weekStart: Date): Promise<PlantCareScore[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return await this.plantCareScoreRepository.find({
      where: {
        idObjectProfile,
        scoreDate: Between(weekStart, weekEnd),
      },
      order: {
        scoreDate: 'ASC',
      },
    });
  }

  async getMonthlyScores(idObjectProfile: number, year: number, month: number): Promise<PlantCareScore[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.plantCareScoreRepository.find({
      where: {
        idObjectProfile,
        scoreDate: Between(startDate, endDate),
      },
      order: {
        scoreDate: 'ASC',
      },
    });
  }

  async calculateDailyScore(sensorData: any): Promise<{
    dailyScore: number;
    moistureScore: number;
    temperatureScore: number;
    lightScore: number;
    phScore: number;
    consistencyBonus: number;
    dailyMessage: string;
    isPerfectDay: boolean;
  }> {
    // Calculate individual sensor scores
    const moistureScore = this.calculateMoistureScore(sensorData.humidityGroundSensor);
    const temperatureScore = this.calculateTemperatureScore(sensorData.temperatureSensorGround);
    const lightScore = this.calculateLightScore(sensorData.lightSensor);
    const phScore = this.calculatePhScore(sensorData.phGroundSensor);
    
    // Consistency bonus (if all sensors are in good range)
    const consistencyBonus = this.calculateConsistencyBonus(moistureScore, temperatureScore, lightScore, phScore);
    
    // Total daily score
    const dailyScore = moistureScore + temperatureScore + lightScore + phScore + consistencyBonus;
    
    // Determine message and perfect day status
    const { dailyMessage, isPerfectDay } = this.getDailyMessageAndStatus(dailyScore);
    
    return {
      dailyScore,
      moistureScore,
      temperatureScore,
      lightScore,
      phScore,
      consistencyBonus,
      dailyMessage,
      isPerfectDay,
    };
  }

  async calculateWeeklyScore(dailyScores: PlantCareScore[]): Promise<{
    weeklyScore: number;
    improvementBonus: number;
    weeklyMessage: string;
    isPerfectWeek: boolean;
  }> {
    if (dailyScores.length === 0) {
      return {
        weeklyScore: 0,
        improvementBonus: 0,
        weeklyMessage: 'No data available',
        isPerfectWeek: false,
      };
    }

    // Calculate daily average (70% of total)
    const dailyAverage = dailyScores.reduce((sum, score) => sum + score.dailyScore, 0) / dailyScores.length;
    const dailyAverageScore = Math.round(dailyAverage * 0.7);

    // Calculate consistency bonus (20% of total)
    const consistencyBonus = this.calculateWeeklyConsistencyBonus(dailyScores);

    // Calculate improvement bonus (10% of total)
    const improvementBonus = this.calculateImprovementBonus(dailyScores);

    // Total weekly score
    const weeklyScore = dailyAverageScore + consistencyBonus + improvementBonus;

    // Determine message and perfect week status
    const { weeklyMessage, isPerfectWeek } = this.getWeeklyMessageAndStatus(weeklyScore);

    return {
      weeklyScore,
      improvementBonus,
      weeklyMessage,
      isPerfectWeek,
    };
  }

  private calculateMoistureScore(humidity: number): number {
    if (!humidity) return 0;
    
    // Optimal range: 40-70%
    if (humidity >= 40 && humidity <= 70) return 10;
    if (humidity >= 30 && humidity < 40) return 7;
    if (humidity > 70 && humidity <= 80) return 7;
    if (humidity >= 20 && humidity < 30) return 4;
    if (humidity > 80 && humidity <= 90) return 4;
    return 0; // Critical
  }

  private calculateTemperatureScore(temperature: number): number {
    if (!temperature) return 0;
    
    // Optimal range: 18-25°C
    if (temperature >= 18 && temperature <= 25) return 8;
    if (temperature >= 15 && temperature < 18) return 6;
    if (temperature > 25 && temperature <= 28) return 6;
    if (temperature >= 12 && temperature < 15) return 3;
    if (temperature > 28 && temperature <= 30) return 3;
    return 0; // Critical
  }

  private calculateLightScore(light: number): number {
    if (!light) return 0;
    
    // Optimal range: 15000-35000 lux
    if (light >= 15000 && light <= 35000) return 6;
    if (light >= 10000 && light < 15000) return 4;
    if (light > 35000 && light <= 45000) return 4;
    if (light >= 5000 && light < 10000) return 2;
    if (light > 45000 && light <= 55000) return 2;
    return 0; // Critical
  }

  private calculatePhScore(ph: number): number {
    if (!ph) return 0;
    
    // Optimal range: 6.0-7.0
    if (ph >= 6.0 && ph <= 7.0) return 4;
    if (ph >= 5.5 && ph < 6.0) return 3;
    if (ph > 7.0 && ph <= 7.5) return 3;
    if (ph >= 5.0 && ph < 5.5) return 1;
    if (ph > 7.5 && ph <= 8.0) return 1;
    return 0; // Critical
  }

  private calculateConsistencyBonus(moisture: number, temperature: number, light: number, ph: number): number {
    // Bonus if all sensors are in good or optimal range
    const scores = [moisture, temperature, light, ph];
    const goodScores = scores.filter(score => score >= 3).length;
    
    if (goodScores === 4) return 2; // All good
    if (goodScores === 3) return 1; // Most good
    return 0;
  }

  private calculateWeeklyConsistencyBonus(dailyScores: PlantCareScore[]): number {
    const goodDays = dailyScores.filter(score => score.dailyScore >= 20).length;
    const totalDays = dailyScores.length;
    
    if (totalDays === 0) return 0;
    
    const consistencyRate = goodDays / totalDays;
    
    if (consistencyRate >= 0.9) return 40; // 90%+ good days
    if (consistencyRate >= 0.8) return 30; // 80%+ good days
    if (consistencyRate >= 0.7) return 20; // 70%+ good days
    if (consistencyRate >= 0.6) return 10; // 60%+ good days
    return 0;
  }

  private calculateImprovementBonus(dailyScores: PlantCareScore[]): number {
    if (dailyScores.length < 2) return 0;
    
    // Check if scores are improving over the week
    const firstHalf = dailyScores.slice(0, Math.ceil(dailyScores.length / 2));
    const secondHalf = dailyScores.slice(Math.ceil(dailyScores.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, score) => sum + score.dailyScore, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, score) => sum + score.dailyScore, 0) / secondHalf.length;
    
    const improvement = secondHalfAvg - firstHalfAvg;
    
    if (improvement >= 5) return 20; // Significant improvement
    if (improvement >= 3) return 15; // Moderate improvement
    if (improvement >= 1) return 10; // Slight improvement
    return 0;
  }

  private getDailyMessageAndStatus(score: number): { dailyMessage: string; isPerfectDay: boolean } {
    if (score >= 25) {
      return { dailyMessage: 'Perfect Day! 🌟', isPerfectDay: true };
    } else if (score >= 20) {
      return { dailyMessage: 'Great Job! 👍', isPerfectDay: false };
    } else if (score >= 15) {
      return { dailyMessage: 'Good Work! 😊', isPerfectDay: false };
    } else if (score >= 10) {
      return { dailyMessage: 'Not Bad! 🤔', isPerfectDay: false };
    } else if (score >= 5) {
      return { dailyMessage: 'Needs Attention ⚠️', isPerfectDay: false };
    } else {
      return { dailyMessage: 'Critical Issues! 🚨', isPerfectDay: false };
    }
  }

  private getWeeklyMessageAndStatus(score: number): { weeklyMessage: string; isPerfectWeek: boolean } {
    if (score >= 180) {
      return { weeklyMessage: 'Plant Care Master! 👑', isPerfectWeek: true };
    } else if (score >= 160) {
      return { weeklyMessage: 'Excellent Week! 🌟', isPerfectWeek: false };
    } else if (score >= 140) {
      return { weeklyMessage: 'Great Progress! 👍', isPerfectWeek: false };
    } else if (score >= 120) {
      return { weeklyMessage: 'Good Work! 😊', isPerfectWeek: false };
    } else if (score >= 100) {
      return { weeklyMessage: 'Not Bad! 🤔', isPerfectWeek: false };
    } else if (score >= 80) {
      return { weeklyMessage: 'Needs Improvement ⚠️', isPerfectWeek: false };
    } else if (score >= 60) {
      return { weeklyMessage: 'Requires Attention 🚨', isPerfectWeek: false };
    } else {
      return { weeklyMessage: 'Critical Care Issues! 💀', isPerfectWeek: false };
    }
  }
} 