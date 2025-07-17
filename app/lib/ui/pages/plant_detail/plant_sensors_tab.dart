import 'package:flutter/material.dart';
import '../../../models/object_profile.dart';
import '../../../l10n/app_localizations.dart';

class PlantSensorsTab extends StatefulWidget {
  final ObjectProfile plant;

  const PlantSensorsTab({Key? key, required this.plant}) : super(key: key);

  @override
  State<PlantSensorsTab> createState() => _PlantSensorsTabState();
}

class _PlantSensorsTabState extends State<PlantSensorsTab> {
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
            _processMoistureSensor(widget.plant.humidityGroundSensor),
            Icons.water_drop,
            '%',
            0,
            100,
            Colors.blue[600]!,
            _getOptimalRange('humidity_ground', '40-70%'),
          ),
          const SizedBox(height: 12),
          _buildSensorCard(
            localizations.soilPH,
            widget.plant.phGroundSensor,
            Icons.science,
            'pH',
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
            1000,
            Colors.green[600]!,
            _getOptimalRange('conductivity', '300-700'),
          ),
          const SizedBox(height: 12),
          _buildSensorCard(
            localizations.groundTemp,
            _processTemperatureSensor(widget.plant.temperatureSensorGround),
            Icons.device_thermostat,
            '°C',
            -40,
            80,
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
            _processAirHumiditySensor(widget.plant.humidityAirSensor),
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
            _processTemperatureSensor(widget.plant.temperatureSensorExtern),
            Icons.thermostat,
            '°C',
            -40,
            80,
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
            _processLightSensor(widget.plant.lightSensor),
            Icons.wb_sunny,
            ' lux',
            0,
            1000,
            Colors.yellow[600]!,
            _getOptimalRange('light', '200-800 lux'),
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
    String displayValue = '--';
    double progress = 0.0;
    String statusText = 'No data';
    Color statusColor = Colors.grey[500]!;

    if (value != null) {
      final numValue = value is String ? double.tryParse(value) : value as double?;
      if (numValue != null) {
        // Format display value - remove decimals for percentages, show 1 decimal for others
        if (unit == '%') {
          displayValue = numValue.round().toString();
        } else if (unit == '°C' || unit == 'pH') {
          displayValue = numValue.toStringAsFixed(1);
        } else {
          displayValue = numValue.round().toString();
        }
        
        // Use plant-specific optimal ranges if available, otherwise fall back to generic ranges
        double optimalMin = minValue;
        double optimalMax = maxValue;
        
        // Try to parse optimal range from the string (e.g., "40-80%" -> 40, 80)
        final rangeMatch = RegExp(r'(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)').firstMatch(optimalRange);
        if (rangeMatch != null) {
          optimalMin = double.parse(rangeMatch.group(1)!);
          optimalMax = double.parse(rangeMatch.group(2)!);
        }
        
        // Simple progress calculation: percentage of the full range
        progress = ((numValue - minValue) / (maxValue - minValue)).clamp(0.0, 1.0);
        
        // Determine status based on optimal ranges
        if (numValue < optimalMin * 0.7) {
          statusText = 'Critical';
          statusColor = Colors.red[600]!;
        } else if (numValue < optimalMin) {
          statusText = 'Low';
          statusColor = Colors.orange[600]!;
        } else if (numValue <= optimalMax) {
          statusText = 'Good';
          statusColor = Colors.green[600]!;
        } else if (numValue <= optimalMax * 1.3) {
          statusText = 'High';
          statusColor = Colors.orange[600]!;
        } else {
          statusText = 'Critical';
          statusColor = Colors.red[600]!;
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
    // This method is no longer dependent on _plantRequirements
    // It will return the default range for all sensors
    return 'Optimal: $defaultRange';
  }

  // Sensor processing methods (same as backend)
  double? _processMoistureSensor(double? rawValue) {
    if (rawValue == null) return null;
    // Same logic as backend: ((4095 - rawValue) / 4095) * 100
    final moisturePercentage = ((4095 - rawValue) / 4095) * 100;
    return moisturePercentage.clamp(0.0, 100.0);
  }

  double? _processLightSensor(double? rawValue) {
    if (rawValue == null) return null;
    // Same logic as backend: rawValue > 0 ? 800 : 200
    return rawValue > 0 ? 800.0 : 200.0;
  }

  double? _processTemperatureSensor(double? rawValue) {
    if (rawValue == null) return null;
    // Same logic as backend: clamp between -40 and 80
    return rawValue.clamp(-40.0, 80.0);
  }

  double? _processAirHumiditySensor(double? rawValue) {
    if (rawValue == null) return null;
    // Same logic as backend: clamp between 0 and 100
    return rawValue.clamp(0.0, 100.0);
  }
} 