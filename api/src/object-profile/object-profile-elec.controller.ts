import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query, Logger } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ObjectProfileService } from './object-profile.service';
import { SensorDataService, SensorData } from './sensor-data.service';
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
        private readonly sensorDataService: SensorDataService,
    ) {}

    @Patch(':id/sensor-data')
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Process ESP32 sensor data and trigger notifications' })
    @ApiBody({ type: SensorDataDto })
    async processSensorData(
        @Param('id') id: string, 
        @Body() sensorData: SensorDataDto
    ) {
        this.logger.log(`📡 Received sensor data for object ${id}`);
        
        try {
            // Validate sensor data
            if (!this.sensorDataService.validateSensorData(sensorData)) {
                this.logger.warn(`⚠️ Invalid sensor data received for object ${id}`);
                return {
                    success: false,
                    error: 'Invalid sensor data received',
                    timestamp: new Date().toISOString(),
                };
            }

            // Process sensor data and trigger notifications
            const result = await this.sensorDataService.processSensorData(+id, sensorData);
            
            this.logger.log(`✅ Sensor data processed for object ${id} - ${result.alertsSent.length} alerts sent`);
            
            return {
                ...result,
                timestamp: new Date().toISOString(),
                objectId: +id,
            };
            
        } catch (error) {
            this.logger.error(`❌ Error processing sensor data for object ${id}: ${error.message}`);
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