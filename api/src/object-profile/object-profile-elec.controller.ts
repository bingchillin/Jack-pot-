import { Controller, Body, Patch, Param, ClassSerializerInterceptor, UseInterceptors, Logger, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ObjectProfileService } from './object-profile.service';
import { PlantCareService } from '../plant-care/plant-care.service';
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
            
            return result;
            
        } catch (error) {
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

    @Get(':id')
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.objectProfileService.findOne(+id);
    }

} 