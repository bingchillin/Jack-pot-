import { Controller, Post, Param, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlantCareService } from './plant-care.service';
import { PlantHealthCalculationService } from './plant-health-calculation.service';

@ApiTags('Plant Care')
@Controller('plant-care')
export class PlantCareController {
  private readonly logger = new Logger(PlantCareController.name);

  constructor(
    private readonly plantCareService: PlantCareService,
    private readonly plantHealthCalculationService: PlantHealthCalculationService,
  ) {}

  /**
   * Manually recalculate plant health for testing
   */
  @Post(':id/recalculate-health')
  @ApiOperation({ summary: 'Manually recalculate plant health using current sensor data' })
  @ApiResponse({ status: 200, description: 'Health recalculated successfully' })
  async recalculateHealth(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`🔄 Manual health recalculation requested for object ${id}`);
      const result = await this.plantHealthCalculationService.recalculateHealthFromDatabase(+id);
      return {
        success: true,
        message: 'Health recalculated successfully',
        healthResult: result,
      };
    } catch (error) {
      this.logger.error(`❌ Error in manual health recalculation: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process sensor data (for ESP32)
   */
  @Post(':id/process-sensor-data')
  @ApiOperation({ summary: 'Process sensor data from ESP32' })
  @ApiResponse({ status: 200, description: 'Sensor data processed successfully' })
  async processSensorData(@Param('id') id: string, @Body() sensorData: any): Promise<any> {
    try {
      this.logger.log(`📡 Processing sensor data for object ${id}`);
      const result = await this.plantCareService.processPlantCare(+id, sensorData);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error processing sensor data: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
} 