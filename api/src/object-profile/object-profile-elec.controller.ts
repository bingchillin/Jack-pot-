import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query, Logger } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ObjectProfileService } from './object-profile.service';
import { PlantCareService } from '../plant-care/plant-care.service';
import { CreateObjectProfileDto } from './dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from './dto/update-object-profile.dto';
import { SensorDataDto } from './dto/sensor-data.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Object Profile Electronics')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('object-profile-elec')
export class ObjectProfileElecController {
    private readonly logger = new Logger(ObjectProfileElecController.name);

    constructor(
        private readonly objectProfileService: ObjectProfileService,
        private readonly plantCareService: PlantCareService,
    ) {}

    @Patch(':id/sensor-data')
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Process ESP32 sensor data with unified plant care system' })
    @ApiBody({ type: SensorDataDto })
    async processSensorData(
        @Param('id') id: string, 
        @Body() sensorData: any
    ) {
        this.logger.log(`📡 Received sensor data for object ${id}`);
        
        try {
            // Use unified plant care service
            const result = await this.plantCareService.processPlantCare(+id, sensorData);
            
            this.logger.log(`✅ Plant care processed for object ${id}:`, {
                health: result.analysis.plantHealth,
                watering: result.controlCommands.isWillWatering,
                lighting: result.controlCommands.lightSensor,
                alerts: result.alertsSent.length,
            });
            
            return result;
            
        } catch (error) {
            this.logger.error(`❌ Error processing plant care for object ${id}: ${error.message}`);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
                objectId: +id,
            };
        }
    }

    @Patch(':id')
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdateObjectProfileDto })
    update(@Param('id') id: string, @Body() updateObjectProfileDto: UpdateObjectProfileDto) {
        return this.objectProfileService.update(+id, updateObjectProfileDto);
    }

} 