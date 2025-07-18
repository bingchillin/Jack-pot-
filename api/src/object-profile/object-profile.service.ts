import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ObjectProfile } from './entities/object-profile.entity';
import { CreateObjectProfileDto } from './dto/create-object-profile.dto';
import { UpdateObjectProfileDto } from './dto/update-object-profile.dto';
import { PlantHealthCalculationService } from '../plant-care/plant-health-calculation.service';

@Injectable()
export class ObjectProfileService {
    constructor(
        @InjectRepository(ObjectProfile)
        private readonly objectProfileRepository: Repository<ObjectProfile>,
        private readonly plantHealthCalculationService: PlantHealthCalculationService
    ) {}

    create(createObjectProfileDto: CreateObjectProfileDto) {
        const objectProfile = this.objectProfileRepository.create(createObjectProfileDto);
        return this.objectProfileRepository.save(objectProfile);
    }

    findAll() {
        return this.objectProfileRepository.find({
            relations: ['object', 'plantType', 'person', 'plants'],
            select: {
                idObjectProfile: true,
                title: true,
                description: true,
                advise: true,
                isAutomatic: true,
                isWillWatering: true,
                state: true,
                favoris: true,
                healthPercentage: true,
                humidityAirSensor: true,
                humidityGroundSensor: true,
                phGroundSensor: true,
                conductivityElectriqueFertilitySensor: true,
                lightSensor: true,
                temperatureSensorGround: true,
                temperatureSensorExtern: true,
                expositionTimeSun: true,
                createdAt: true,
                updatedAt: true,
                object: {
                    idObject: true,
                    title: true,
                    description: true,
                    advise: true,
                    preferenceNumber: true,
                    isReset: true
                },
                plantType: {
                    idPlantType: true,
                    title: true,
                    description: true,
                    advise: true
                },
                person: {
                    idPerson: true,
                    email: true,
                    firstname: true,
                    surname: true
                },
                plants: {
                    idPlant: true,
                    name: true,
                    description: true,
                    category: true,
                    isAvailable: true
                }
            }
        });
    }

    async findOne(id: number) {
        let objectProfile = await this.objectProfileRepository.findOne({
            where: { idObjectProfile: id },
            relations: ['object', 'plantType', 'person', 'plants', 'plantType.avatars'],
            select: {
                idObjectProfile: true,
                idPerson: true, // Add this field
                idObject: true, // Add this field
                idPlantType: true, // Add this field
                title: true,
                description: true,
                advise: true,
                isAutomatic: true,
                isWillWatering: true,
                state: true,
                favoris: true,
                healthPercentage: true,
                humidityAirSensor: true,
                humidityGroundSensor: true,
                phGroundSensor: true,
                conductivityElectriqueFertilitySensor: true,
                lightSensor: true,
                temperatureSensorGround: true,
                temperatureSensorExtern: true,
                expositionTimeSun: true,
                createdAt: true,
                updatedAt: true,
                object: {
                    idObject: true,
                    title: true,
                    description: true,
                    advise: true,
                    preferenceNumber: true,
                    isReset: true
                },
                plantType: {
                    idPlantType: true,
                    title: true,
                    description: true,
                    advise: true,
                    familyName: true,
                    expositionType: true,
                    phMin: true,
                    phMax: true,
                    conductivityElectriqueFertilityMin: true,
                    conductivityElectriqueFertilityMax: true,
                    temperatureSensorGroundMin: true,
                    temperatureSensorGroundMax: true,
                    temperatureSensorExternMin: true,
                    temperatureSensorExternMax: true,
                    humidityAirSensorMin: true,
                    humidityAirSensorMax: true,
                    humidityGroundSensorMin: true,
                    humidityGroundSensorMax: true,
                    lightSensorMin: true,
                    lightSensorMax: true,
                    expositionTimeSunMin: true,
                    expositionTimeSunMax: true,
                },
                person: {
                    idPerson: true,
                    email: true,
                    firstname: true,
                    surname: true
                },
                plants: {
                    idPlant: true,
                    name: true,
                    description: true,
                    category: true,
                    isAvailable: true
                }
            }
        });

        if (!objectProfile) {
            throw new NotFoundException(`Object profile with ID ${id} not found`);
        }

        // Always trigger health calculation and update (for real-time updates)
        const sensorData = {
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
        const healthResult = await this.plantHealthCalculationService.calculatePlantHealth(id, sensorData);
        await this.objectProfileRepository.update(
            { idObjectProfile: id },
            {
                healthPercentage: healthResult.overallHealth,
                state: healthResult.state,
                updatedAt: new Date(),
            },
        );
        
        // Refetch with updated healthPercentage
        objectProfile = await this.objectProfileRepository.findOne({
            where: { idObjectProfile: id },
            relations: ['object', 'plantType', 'person', 'plants', 'plantType.avatars'],
            select: {
                idObjectProfile: true,
                idPerson: true,
                idObject: true,
                idPlantType: true,
                title: true,
                description: true,
                advise: true,
                isAutomatic: true,
                isWillWatering: true,
                state: true,
                favoris: true,
                healthPercentage: true,
                humidityAirSensor: true,
                humidityGroundSensor: true,
                phGroundSensor: true,
                conductivityElectriqueFertilitySensor: true,
                lightSensor: true,
                temperatureSensorGround: true,
                temperatureSensorExtern: true,
                expositionTimeSun: true,
                createdAt: true,
                updatedAt: true,
                object: {
                    idObject: true,
                    title: true,
                    description: true,
                    advise: true,
                    preferenceNumber: true,
                    isReset: true
                },
                plantType: {
                    idPlantType: true,
                    title: true,
                    description: true,
                    advise: true,
                    familyName: true,
                    expositionType: true,
                    phMin: true,
                    phMax: true,
                    conductivityElectriqueFertilityMin: true,
                    conductivityElectriqueFertilityMax: true,
                    temperatureSensorGroundMin: true,
                    temperatureSensorGroundMax: true,
                    temperatureSensorExternMin: true,
                    temperatureSensorExternMax: true,
                    humidityAirSensorMin: true,
                    humidityAirSensorMax: true,
                    humidityGroundSensorMin: true,
                    humidityGroundSensorMax: true,
                    lightSensorMin: true,
                    lightSensorMax: true,
                    expositionTimeSunMin: true,
                    expositionTimeSunMax: true,
                },
                person: {
                    idPerson: true,
                    email: true,
                    firstname: true,
                    surname: true
                },
                plants: {
                    idPlant: true,
                    name: true,
                    description: true,
                    category: true,
                    isAvailable: true
                }
            }
        });

        return objectProfile;
    }

    async findByTitle(title: string) {
        const objectProfile = await this.objectProfileRepository.findOne({
            where: { title },
            relations: ['object', 'plantType', 'person', 'plants'],
            select: {
                idObjectProfile: true,
                title: true,
                description: true,
                advise: true,
                isAutomatic: true,
                isWillWatering: true,
                state: true,
                favoris: true,
                healthPercentage: true,
                humidityAirSensor: true,
                humidityGroundSensor: true,
                phGroundSensor: true,
                conductivityElectriqueFertilitySensor: true,
                lightSensor: true,
                temperatureSensorGround: true,
                temperatureSensorExtern: true,
                expositionTimeSun: true,
                createdAt: true,
                updatedAt: true,
                object: {
                    idObject: true,
                    title: true,
                    description: true,
                    advise: true,
                    preferenceNumber: true,
                    isReset: true
                },
                plantType: {
                    idPlantType: true,
                    title: true,
                    description: true,
                    advise: true
                },
                person: {
                    idPerson: true,
                    email: true,
                    firstname: true,
                    surname: true
                },
                plants: {
                    idPlant: true,
                    name: true,
                    description: true,
                    category: true,
                    isAvailable: true
                }
            }
        });

        if (!objectProfile) {
            throw new NotFoundException(`Object profile with title ${title} not found`);
        }

        return objectProfile;
    }

    async findByObject(idObject: number) {
        const objectProfiles = await this.objectProfileRepository.find({
            where: { idObject },
            relations: ['object', 'plantType', 'person', 'plants'],
            select: {
                idObjectProfile: true,
                title: true,
                description: true,
                advise: true,
                isAutomatic: true,
                isWillWatering: true,
                state: true,
                favoris: true,
                healthPercentage: true,
                humidityAirSensor: true,
                humidityGroundSensor: true,
                phGroundSensor: true,
                conductivityElectriqueFertilitySensor: true,
                lightSensor: true,
                temperatureSensorGround: true,
                temperatureSensorExtern: true,
                expositionTimeSun: true,
                createdAt: true,
                updatedAt: true,
                object: {
                    idObject: true,
                    title: true,
                    description: true,
                    advise: true,
                    preferenceNumber: true,
                    isReset: true
                },
                plantType: {
                    idPlantType: true,
                    title: true,
                    description: true,
                    advise: true
                },
                person: {
                    idPerson: true,
                    email: true,
                    firstname: true,
                    surname: true
                },
                plants: {
                    idPlant: true,
                    name: true,
                    description: true,
                    category: true,
                    isAvailable: true
                }
            }
        });

        if (!objectProfiles.length) {
            throw new NotFoundException(`No object profiles found for object with ID ${idObject}`);
        }

        return objectProfiles;
    }

    async findByPlantType(idPlantType: number) {
        const objectProfiles = await this.objectProfileRepository.find({
            where: { idPlantType },
            relations: ['object', 'plantType', 'person', 'plants'],
            select: {
                idObjectProfile: true,
                title: true,
                description: true,
                advise: true,
                isAutomatic: true,
                isWillWatering: true,
                state: true,
                favoris: true,
                healthPercentage: true,
                humidityAirSensor: true,
                humidityGroundSensor: true,
                phGroundSensor: true,
                conductivityElectriqueFertilitySensor: true,
                lightSensor: true,
                temperatureSensorGround: true,
                temperatureSensorExtern: true,
                expositionTimeSun: true,
                createdAt: true,
                updatedAt: true,
                object: {
                    idObject: true,
                    title: true,
                    description: true,
                    advise: true,
                    preferenceNumber: true,
                    isReset: true
                },
                plantType: {
                    idPlantType: true,
                    title: true,
                    description: true,
                    advise: true
                },
                person: {
                    idPerson: true,
                    email: true,
                    firstname: true,
                    surname: true
                },
                plants: {
                    idPlant: true,
                    name: true,
                    description: true,
                    category: true,
                    isAvailable: true
                }
            }
        });

        if (!objectProfiles.length) {
            throw new NotFoundException(`No object profiles found for plant type with ID ${idPlantType}`);
        }

        return objectProfiles;
    }

    async update(id: number, updateObjectProfileDto: UpdateObjectProfileDto) {
        const objectProfile = await this.findOne(id);
        Object.assign(objectProfile, updateObjectProfileDto);
        return this.objectProfileRepository.save(objectProfile);
    }

    async remove(id: number) {
        const objectProfile = await this.findOne(id);
        return this.objectProfileRepository.remove(objectProfile);
    }

    async count(options?: FindManyOptions<ObjectProfile>): Promise<number> {
        return await this.objectProfileRepository.count(options);
    }

    async recalculateHealth(id: number) {
        // Use the existing method from PlantHealthCalculationService
        return this.plantHealthCalculationService.recalculateHealthFromDatabase(id);
    }

    async testHealthCalculation(id: number, sensorData: any) {
        // Test health calculation with specific sensor data
        return this.plantHealthCalculationService.calculatePlantHealth(id, sensorData);
    }

    async debugHealth(id: number) {
        // Get current plant data and calculate health without updating
        const objectProfile = await this.objectProfileRepository.findOne({
            where: { idObjectProfile: id },
            relations: ['plantType'],
        });

        if (!objectProfile || !objectProfile.plantType) {
            throw new Error(`Object profile ${id} or plant type not found`);
        }

        const sensorData = {
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

        const healthResult = await this.plantHealthCalculationService.calculatePlantHealth(id, sensorData);

        return {
            currentHealth: objectProfile.healthPercentage,
            calculatedHealth: healthResult.overallHealth,
            plantType: objectProfile.plantType.title,
            sensorData,
            healthResult,
        };
    }
} 