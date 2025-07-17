import 'package:flutter/material.dart';
import '../../../models/object_profile.dart';
import '../../../models/plant_type_requirements.dart';
import '../../../l10n/app_localizations.dart';
import '../../../services/plant_type_requirements_service.dart';

class PlantSensorsTab extends StatefulWidget {
  final ObjectProfile plant;

  const PlantSensorsTab({Key? key, required this.plant}) : super(key: key);

  @override
  State<PlantSensorsTab> createState() => _PlantSensorsTabState();
}

class _PlantSensorsTabState extends State<PlantSensorsTab> {
  PlantTypeRequirements? _plantRequirements;
  bool _isLoadingRequirements = true;

  @override
  void initState() {
    super.initState();
    _loadPlantRequirements();
  }

  Future<void> _loadPlantRequirements() async {
    if (widget.plant.plantType?.idPlantType != null) {
      try {
        // For now, we'll use mock requirements since we don't have the token here
        // In a real implementation, you'd pass the token to this widget
        setState(() {
          _isLoadingRequirements = false;
        });
      } catch (e) {
        setState(() {
          _isLoadingRequirements = false;
        });
      }
    } else {
      setState(() {
        _isLoadingRequirements = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Soil Health Section
          _buildSectionHeader(
            'Soil Health',
            Icons.terrain,
            Colors.brown[600]!,
          ),
          const SizedBox(height: 16),
          _buildSensorCard(
            localizations.soilMoisture,
            widget.plant.humidityGroundSensor,
            Icons.water_drop,
            '%',
            0,
            100,
            Colors.blue[600]!,
            _getOptimalRange('humidity_ground', '40-80%'),
          ),
          const SizedBox(height: 12),
          _buildSensorCard(
            localizations.soilPH,
            widget.plant.phGroundSensor,
            Icons.science,
            ' pH',
            0,
            14,
            Colors.purple[600]!,
            _getOptimalRange('ph', '6.0-7.0'),
          ),
          const SizedBox(height: 12),
          _buildSensorCard(
            localizations.fertility,
            widget.plant.conductivityElectriqueFertilitySensor,
            Icons.eco,
            ' µS/cm',
            0,
            3000,
            Colors.green[600]!,
            _getOptimalRange('conductivity', '500-1500'),
          ),
          const SizedBox(height: 12),
          _buildSensorCard(
            localizations.groundTemp,
            widget.plant.temperatureSensorGround,
            Icons.device_thermostat,
            '°C',
            0,
            40,
            Colors.orange[600]!,
            _getOptimalRange('temperature_ground', '18-24°C'),
          ),

          const SizedBox(height: 32),

          // Environment Section
          _buildSectionHeader(
            'Environment',
            Icons.public,
            Colors.green[600]!,
          ),
          const SizedBox(height: 16),
          _buildSensorCard(
            localizations.airHumidity,
            widget.plant.humidityAirSensor,
            Icons.air,
            '%',
            0,
            100,
            Colors.cyan[600]!,
            _getOptimalRange('humidity_air', '40-60%'),
          ),
          const SizedBox(height: 12),
          _buildSensorCard(
            localizations.temperature,
            widget.plant.temperatureSensorExtern,
            Icons.thermostat,
            '°C',
            0,
            40,
            Colors.red[600]!,
            _getOptimalRange('temperature_extern', '20-26°C'),
          ),

          const SizedBox(height: 32),

          // Light Section
          _buildSectionHeader(
            'Light Conditions',
            Icons.wb_sunny,
            Colors.yellow[700]!,
          ),
          const SizedBox(height: 16),
          _buildSensorCard(
            localizations.lightLevel,
            widget.plant.lightSensor,
            Icons.wb_sunny,
            ' lux',
            0,
            100000,
            Colors.yellow[600]!,
            _getOptimalRange('light', '800-1500'),
          ),
          const SizedBox(height: 12),
          _buildSensorCard(
            localizations.sunExposure,
            widget.plant.expositionTimeSun,
            Icons.wb_sunny_outlined,
            ' hrs',
            0,
            12,
            Colors.orange[600]!,
            _getOptimalRange('exposition_time', '6-8 hours'),
          ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            color: color,
            size: 24,
          ),
        ),
        const SizedBox(width: 16),
        Text(
          title,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
      ],
    );
  }

  Widget _buildSensorCard(
    String label,
    dynamic value,
    IconData icon,
    String unit,
    double minValue,
    double maxValue,
    Color color,
    String optimalRange,
  ) {
    final displayValue = value?.toString() ?? '--';
    double progress = 0.0;
    String statusText = 'No data';
    Color statusColor = Colors.grey[500]!;

    if (value != null) {
      final numValue = value is String ? double.tryParse(value) : value as double?;
      if (numValue != null) {
        progress = ((numValue - minValue) / (maxValue - minValue)).clamp(0.0, 1.0);
        
        // Determine status based on progress
        if (progress < 0.2) {
          statusText = 'Low';
          statusColor = Colors.red[600]!;
        } else if (progress < 0.4) {
          statusText = 'Below';
          statusColor = Colors.orange[600]!;
        } else if (progress <= 0.8) {
          statusText = 'Good';
          statusColor = Colors.green[600]!;
        } else {
          statusText = 'High';
          statusColor = Colors.orange[600]!;
        }
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: color.withValues(alpha: 0.2),
          width: 1.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Header Row
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    size: 24,
                    color: color,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[800],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        optimalRange,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '$displayValue$unit',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        statusText,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Progress Bar
            Row(
              children: [
                Text(
                  '$minValue',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[600],
                  ),
                ),
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                    height: 6,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(3),
                    ),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: progress,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              color.withValues(alpha: 0.7),
                              color,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                  ),
                ),
                Text(
                  '$maxValue',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getOptimalRange(String sensorType, String defaultRange) {
    if (_plantRequirements != null) {
      // Return plant-specific range if available
      switch (sensorType) {
        case 'humidity_ground':
          if (_plantRequirements!.humidityGroundSensorMin != null && _plantRequirements!.humidityGroundSensorMax != null) {
            return '${_plantRequirements!.humidityGroundSensorMin!.toStringAsFixed(0)}-${_plantRequirements!.humidityGroundSensorMax!.toStringAsFixed(0)}%';
          }
          break;
        case 'ph':
          if (_plantRequirements!.phMin != null && _plantRequirements!.phMax != null) {
            return '${_plantRequirements!.phMin!.toStringAsFixed(1)}-${_plantRequirements!.phMax!.toStringAsFixed(1)}';
          }
          break;
        case 'conductivity':
          if (_plantRequirements!.conductivityElectriqueFertilityMin != null && _plantRequirements!.conductivityElectriqueFertilityMax != null) {
            return '${_plantRequirements!.conductivityElectriqueFertilityMin!.toStringAsFixed(0)}-${_plantRequirements!.conductivityElectriqueFertilityMax!.toStringAsFixed(0)} µS/cm';
          }
          break;
        case 'temperature_ground':
          if (_plantRequirements!.temperatureSensorGroundMin != null && _plantRequirements!.temperatureSensorGroundMax != null) {
            return '${_plantRequirements!.temperatureSensorGroundMin!.toStringAsFixed(1)}-${_plantRequirements!.temperatureSensorGroundMax!.toStringAsFixed(1)}°C';
          }
          break;
        case 'humidity_air':
          if (_plantRequirements!.humidityAirSensorMin != null && _plantRequirements!.humidityAirSensorMax != null) {
            return '${_plantRequirements!.humidityAirSensorMin!.toStringAsFixed(0)}-${_plantRequirements!.humidityAirSensorMax!.toStringAsFixed(0)}%';
          }
          break;
        case 'temperature_extern':
          if (_plantRequirements!.temperatureSensorExternMin != null && _plantRequirements!.temperatureSensorExternMax != null) {
            return '${_plantRequirements!.temperatureSensorExternMin!.toStringAsFixed(1)}-${_plantRequirements!.temperatureSensorExternMax!.toStringAsFixed(1)}°C';
          }
          break;
        case 'light':
          if (_plantRequirements!.lightSensorMin != null && _plantRequirements!.lightSensorMax != null) {
            return '${_plantRequirements!.lightSensorMin!.toStringAsFixed(0)}-${_plantRequirements!.lightSensorMax!.toStringAsFixed(0)} lux';
          }
          break;
        case 'exposition_time':
          if (_plantRequirements!.expositionTimeSunMin != null && _plantRequirements!.expositionTimeSunMax != null) {
            return '${_plantRequirements!.expositionTimeSunMin!.toStringAsFixed(1)}-${_plantRequirements!.expositionTimeSunMax!.toStringAsFixed(1)} hours';
          }
          break;
      }
    }
    return 'Optimal: $defaultRange';
  }
} 