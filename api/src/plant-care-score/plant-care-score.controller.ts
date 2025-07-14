import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PlantCareScoreService } from './plant-care-score.service';
import { CreatePlantCareScoreDto } from './dto/create-plant-care-score.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Plant Care Scores')
@Controller('plant-care-scores')
@UseGuards(JwtAuthGuard)
export class PlantCareScoreController {
  constructor(private readonly plantCareScoreService: PlantCareScoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plant care score' })
  @ApiResponse({ status: 201, description: 'Score created successfully' })
  async create(@Body() createPlantCareScoreDto: CreatePlantCareScoreDto) {
    return await this.plantCareScoreService.create(createPlantCareScoreDto);
  }

  @Get('plant/:idObjectProfile/daily/:date')
  @ApiOperation({ summary: 'Get daily score for a plant' })
  @ApiResponse({ status: 200, description: 'Daily score retrieved' })
  async getDailyScore(
    @Param('idObjectProfile') idObjectProfile: string,
    @Param('date') date: string,
  ) {
    const dateObj = new Date(date);
    return await this.plantCareScoreService.findByPlantAndDate(
      parseInt(idObjectProfile),
      dateObj,
    );
  }

  @Get('plant/:idObjectProfile/weekly')
  @ApiOperation({ summary: 'Get weekly scores for a plant' })
  @ApiResponse({ status: 200, description: 'Weekly scores retrieved' })
  async getWeeklyScores(
    @Param('idObjectProfile') idObjectProfile: string,
    @Query('weekStart') weekStart: string,
  ) {
    const weekStartDate = new Date(weekStart);
    return await this.plantCareScoreService.getWeeklyScores(
      parseInt(idObjectProfile),
      weekStartDate,
    );
  }

  @Get('plant/:idObjectProfile/monthly')
  @ApiOperation({ summary: 'Get monthly scores for a plant' })
  @ApiResponse({ status: 200, description: 'Monthly scores retrieved' })
  async getMonthlyScores(
    @Param('idObjectProfile') idObjectProfile: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return await this.plantCareScoreService.getMonthlyScores(
      parseInt(idObjectProfile),
      parseInt(year),
      parseInt(month),
    );
  }

  @Get('plant/:idObjectProfile/range')
  @ApiOperation({ summary: 'Get scores for a date range' })
  @ApiResponse({ status: 200, description: 'Scores for date range retrieved' })
  async getScoresByRange(
    @Param('idObjectProfile') idObjectProfile: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    return await this.plantCareScoreService.findByPlantAndDateRange(
      parseInt(idObjectProfile),
      startDateObj,
      endDateObj,
    );
  }

  @Post('plant/:idObjectProfile/calculate-daily')
  @ApiOperation({ summary: 'Calculate daily score from sensor data' })
  @ApiResponse({ status: 200, description: 'Daily score calculated' })
  async calculateDailyScore(
    @Param('idObjectProfile') idObjectProfile: string,
    @Body() sensorData: any,
  ) {
    return await this.plantCareScoreService.calculateDailyScore(sensorData);
  }

  @Post('plant/:idObjectProfile/calculate-weekly')
  @ApiOperation({ summary: 'Calculate weekly score from daily scores' })
  @ApiResponse({ status: 200, description: 'Weekly score calculated' })
  async calculateWeeklyScore(
    @Param('idObjectProfile') idObjectProfile: string,
    @Body() dailyScores: any[],
  ) {
    return await this.plantCareScoreService.calculateWeeklyScore(dailyScores);
  }
} 