import { IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SensorDataDto {
  @ApiProperty({ description: 'Object/Plant ID that the sensor data belongs to' })
  @IsNumber()
  objectId: number;

  @ApiProperty({ 
    description: 'Soil moisture percentage (0-100)',
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  moisture?: number;

  @ApiProperty({ 
    description: 'Light level in lux',
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lightLevel?: number;

  @ApiProperty({ 
    description: 'Temperature in Celsius',
    required: false
  })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ 
    description: 'Humidity percentage (0-100)',
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number;

  @ApiProperty({ 
    description: 'Soil nutrient level percentage (0-100)',
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  soilNutrients?: number;

  @ApiProperty({ 
    description: 'pH level of soil (0-14)',
    minimum: 0,
    maximum: 14,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  phLevel?: number;

  @ApiProperty({ 
    description: 'Timestamp when sensor data was collected',
    required: false
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
} 