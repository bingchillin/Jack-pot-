import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class SensorDataDto {
  @ApiProperty({
    description: 'Air humidity percentage',
    minimum: 0,
    maximum: 100,
    example: 65.5
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidityAirSensor: number;

  @ApiProperty({
    description: 'Ground moisture sensor reading (ESP32 analog 0-4095)',
    minimum: 0,
    maximum: 4095,
    example: 2500
  })
  @IsNumber()
  @Min(0)
  @Max(4095)
  humidityGroundSensor: number;

  @ApiProperty({
    description: 'Soil pH level',
    minimum: 0,
    maximum: 14,
    example: 6.5
  })
  @IsNumber()
  @Min(0)
  @Max(14)
  phGroundSensor: number;

  @ApiProperty({
    description: 'Soil electrical conductivity for fertility measurement',
    minimum: 0,
    maximum: 1000,
    example: 450
  })
  @IsNumber()
  @Min(0)
  @Max(1000)
  conductivityElectriqueFertilitySensor: number;

  @ApiProperty({
    description: 'Light sensor status (0 = no light, 1 = light detected)',
    minimum: 0,
    maximum: 1,
    example: 1
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  lightSensor: number;

  @ApiProperty({
    description: 'Ground temperature in Celsius',
    minimum: -40,
    maximum: 80,
    example: 22.5
  })
  @IsNumber()
  @Min(-40)
  @Max(80)
  temperatureSensorGround: number;

  @ApiProperty({
    description: 'External temperature in Celsius',
    minimum: -40,
    maximum: 80,
    example: 24.0
  })
  @IsNumber()
  @Min(-40)
  @Max(80)
  temperatureSensorExtern: number;

  @ApiProperty({
    description: 'Sun exposure time in seconds',
    minimum: 0,
    maximum: 86400,
    example: 28800
  })
  @IsNumber()
  @Min(0)
  @Max(86400)
  expositionTimeSun: number;

  @ApiProperty({
    description: 'Water level sensor reading (0-700)',
    minimum: 0,
    maximum: 700,
    example: 350
  })
  @IsNumber()
  @Min(0)
  @Max(700)
  water_sensor: number;
} 