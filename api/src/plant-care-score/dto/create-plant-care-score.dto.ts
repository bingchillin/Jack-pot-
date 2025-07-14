import { IsNumber, IsDate, IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlantCareScoreDto {
  @ApiProperty({ description: 'Object profile ID' })
  @IsNumber()
  idObjectProfile: number;

  @ApiProperty({ description: 'Score date' })
  @IsDate()
  scoreDate: Date;

  @ApiProperty({ description: 'Daily score (0-30)' })
  @IsNumber()
  dailyScore: number;

  @ApiProperty({ description: 'Weekly score (0-200)' })
  @IsNumber()
  weeklyScore: number;

  @ApiProperty({ description: 'Moisture score (0-10)' })
  @IsNumber()
  moistureScore: number;

  @ApiProperty({ description: 'Temperature score (0-8)' })
  @IsNumber()
  temperatureScore: number;

  @ApiProperty({ description: 'Light score (0-6)' })
  @IsNumber()
  lightScore: number;

  @ApiProperty({ description: 'pH score (0-4)' })
  @IsNumber()
  phScore: number;

  @ApiProperty({ description: 'Consistency bonus (0-2)' })
  @IsNumber()
  consistencyBonus: number;

  @ApiProperty({ description: 'Improvement bonus (0-20)' })
  @IsNumber()
  improvementBonus: number;

  @ApiProperty({ description: 'Daily message' })
  @IsOptional()
  @IsString()
  dailyMessage?: string;

  @ApiProperty({ description: 'Weekly message' })
  @IsOptional()
  @IsString()
  weeklyMessage?: string;

  @ApiProperty({ description: 'Sensor data JSON' })
  @IsOptional()
  @IsObject()
  sensorData?: any;

  @ApiProperty({ description: 'Is perfect day' })
  @IsBoolean()
  isPerfectDay: boolean;

  @ApiProperty({ description: 'Is perfect week' })
  @IsBoolean()
  isPerfectWeek: boolean;
} 