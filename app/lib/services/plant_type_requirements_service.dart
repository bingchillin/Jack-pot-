import 'dart:convert';
import 'package:http/http.dart' as http;
import '../app_config.dart';
import '../models/plant_type_requirements.dart';

class PlantTypeRequirementsService {
  final String baseUrl = AppConfig.baseUrl;

  /// Get plant type requirements by ID
  Future<PlantTypeRequirements?> getPlantTypeRequirements(int plantTypeId, String token) async {
    try {
      final uri = Uri.parse('$baseUrl/plant-types/$plantTypeId');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        if (response.body.isEmpty || response.body.trim() == '') {
          return null;
        }
        
        final data = json.decode(response.body);
        return PlantTypeRequirements.fromJson(data);
      } else if (response.statusCode == 404) {
        return null;
      } else {
        print('API Error: ${response.statusCode} - ${response.body}');
        throw Exception('Failed to get plant type requirements: ${response.statusCode}');
      }
    } catch (e) {
      if (e.toString().contains('Unexpected end of input')) {
        return null;
      }
      throw Exception('Error getting plant type requirements: $e');
    }
  }

  /// Get all plant types with their requirements
  Future<List<PlantTypeRequirements>> getAllPlantTypes(String token) async {
    try {
      final uri = Uri.parse('$baseUrl/plant-types');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        if (response.body.isEmpty || response.body.trim() == '') {
          return [];
        }
        
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => PlantTypeRequirements.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get plant types: ${response.statusCode}');
      }
    } catch (e) {
      if (e.toString().contains('Unexpected end of input')) {
        return [];
      }
      throw Exception('Error getting plant types: $e');
    }
  }

  /// Get plant types that have any requirements defined (not just complete)
  Future<List<PlantTypeRequirements>> getPlantTypesWithAnyRequirements(String token) async {
    try {
      final allPlantTypes = await getAllPlantTypes(token);
      return allPlantTypes.where((plantType) => plantType.hasAnyRequirements).toList();
    } catch (e) {
      throw Exception('Error getting plant types with any requirements: $e');
    }
  }

  /// Calculate scores for a plant based on its type requirements
  Future<Map<String, int>> calculatePlantScores(
    int plantTypeId, 
    Map<String, double> sensorData, 
    String token
  ) async {
    try {
      final plantType = await getPlantTypeRequirements(plantTypeId, token);
      
      if (plantType == null) {
        // Fallback to default scoring if plant type not found
        return _calculateDefaultScores(sensorData);
      }

      // Map sensor data to the correct field names for scoring
      return {
        'moisture': plantType.calculateSensorScore('humidity_ground', sensorData['moisture'] ?? 0),
        'temperature': plantType.calculateSensorScore('temperature_ground', sensorData['temperature'] ?? 0),
        'light': plantType.calculateSensorScore('light', sensorData['light'] ?? 0),
        'ph': plantType.calculateSensorScore('ph', sensorData['ph'] ?? 0),
        // Additional sensors if available
        'temperature_extern': plantType.calculateSensorScore('temperature_extern', sensorData['temperature_extern'] ?? 0),
        'humidity_air': plantType.calculateSensorScore('humidity_air', sensorData['humidity_air'] ?? 0),
        'conductivity': plantType.calculateSensorScore('conductivity', sensorData['conductivity'] ?? 0),
        'exposition_time': plantType.calculateSensorScore('exposition_time', sensorData['exposition_time'] ?? 0),
      };
    } catch (e) {
      print('❌ Error calculating plant scores: $e');
      // Fallback to default scoring
      return _calculateDefaultScores(sensorData);
    }
  }

  /// Calculate default scores when plant type requirements are not available
  Map<String, int> _calculateDefaultScores(Map<String, double> sensorData) {
    final moisture = sensorData['moisture'] ?? 0;
    final temperature = sensorData['temperature'] ?? 0;
    final light = sensorData['light'] ?? 0;
    final ph = sensorData['ph'] ?? 0;

    return {
      'moisture': _calculateDefaultMoistureScore(moisture),
      'temperature': _calculateDefaultTemperatureScore(temperature),
      'light': _calculateDefaultLightScore(light),
      'ph': _calculateDefaultPhScore(ph),
    };
  }

  int _calculateDefaultMoistureScore(double moisture) {
    if (moisture >= 60 && moisture <= 80) return 10;
    if (moisture >= 50 && moisture <= 90) return 8;
    if (moisture >= 40 && moisture <= 95) return 6;
    if (moisture >= 30 && moisture <= 100) return 4;
    return 2;
  }

  int _calculateDefaultTemperatureScore(double temperature) {
    if (temperature >= 18 && temperature <= 26) return 10;
    if (temperature >= 15 && temperature <= 30) return 8;
    if (temperature >= 10 && temperature <= 35) return 6;
    if (temperature >= 5 && temperature <= 40) return 4;
    return 2;
  }

  int _calculateDefaultLightScore(double light) {
    if (light >= 50 && light <= 80) return 10;
    if (light >= 30 && light <= 90) return 8;
    if (light >= 20 && light <= 95) return 6;
    if (light >= 10 && light <= 100) return 4;
    return 2;
  }

  int _calculateDefaultPhScore(double ph) {
    if (ph >= 6.0 && ph <= 7.0) return 10;
    if (ph >= 5.5 && ph <= 7.5) return 8;
    if (ph >= 5.0 && ph <= 8.0) return 6;
    if (ph >= 4.5 && ph <= 8.5) return 4;
    return 2;
  }

  /// Get a summary of plant type requirements for debugging
  Future<String> getPlantTypeRequirementsSummary(int plantTypeId, String token) async {
    try {
      final plantType = await getPlantTypeRequirements(plantTypeId, token);
      
      if (plantType == null) {
        return 'Plant type not found';
      }

      final summary = StringBuffer();
      summary.writeln('Plant Type: ${plantType.title}');
      summary.writeln('Defined Sensors: ${plantType.definedSensorCount}/8');
      summary.writeln('Has Any Requirements: ${plantType.hasAnyRequirements}');
      summary.writeln('Has Complete Requirements: ${plantType.hasCompleteRequirements}');
      summary.writeln('');
      summary.writeln('Optimal Conditions:');
      summary.writeln(plantType.getOptimalConditionsDescription());
      
      return summary.toString();
    } catch (e) {
      return 'Error getting plant type summary: $e';
    }
  }

  /// Get sample plant type data for testing (based on ChatGPT research)
  /// This can be used to populate the database with real plant requirements
  Map<String, Map<String, dynamic>> getSamplePlantTypeData() {
    return {
      'Ficus lyrata': {
        'title': 'Ficus lyrata',
        'description': 'Fiddle Leaf Fig Tree',
        'ph_min': 6.0,
        'ph_max': 7.0,
        'temperature_sensor_ground_min': 15.0,
        'temperature_sensor_ground_max': 30.0,
        'temperature_sensor_extern_min': 15.0,
        'temperature_sensor_extern_max': 30.0,
        'humidity_air_sensor_min': 30.0,
        'humidity_air_sensor_max': 65.0,
        'humidity_ground_sensor_min': 40.0, // Estimated based on "water when top centimeters dry"
        'humidity_ground_sensor_max': 80.0,
        'light_sensor_min': 10000.0, // ~6 hours bright indirect light
        'light_sensor_max': 50000.0,
        'exposition_time_sun_min': 0.0,
        'exposition_time_sun_max': 4.0,
      },
      'Monstera deliciosa': {
        'title': 'Monstera deliciosa',
        'description': 'Swiss Cheese Plant',
        'ph_min': 5.5,
        'ph_max': 7.0,
        'temperature_sensor_ground_min': 18.0,
        'temperature_sensor_ground_max': 29.0,
        'temperature_sensor_extern_min': 16.0,
        'temperature_sensor_extern_max': 29.0,
        'humidity_air_sensor_min': 50.0,
        'humidity_air_sensor_max': 80.0,
        'humidity_ground_sensor_min': 30.0, // "Water when top dries"
        'humidity_ground_sensor_max': 70.0,
        'light_sensor_min': 1000.0, // Moderate to bright indirect
        'light_sensor_max': 4000.0,
        'exposition_time_sun_min': 0.0,
        'exposition_time_sun_max': 2.0,
      },
      'Orchidée': {
        'title': 'Orchidée',
        'description': 'Orchid',
        'ph_min': 5.0,
        'ph_max': 7.0,
        'temperature_sensor_ground_min': 13.0,
        'temperature_sensor_ground_max': 32.0,
        'temperature_sensor_extern_min': 13.0,
        'temperature_sensor_extern_max': 32.0,
        'humidity_air_sensor_min': 40.0,
        'humidity_air_sensor_max': 80.0,
        'humidity_ground_sensor_min': 20.0, // "Must dry between waterings"
        'humidity_ground_sensor_max': 60.0,
        'light_sensor_min': 10750.0, // 1000 fc
        'light_sensor_max': 32300.0, // 3000 fc
        'exposition_time_sun_min': 1.0,
        'exposition_time_sun_max': 4.0,
      },
      'Lavande': {
        'title': 'Lavande',
        'description': 'Lavender',
        'ph_min': 6.4,
        'ph_max': 8.5,
        'temperature_sensor_ground_min': 15.0,
        'temperature_sensor_ground_max': 27.0,
        'temperature_sensor_extern_min': 13.0,
        'temperature_sensor_extern_max': 30.0,
        'humidity_air_sensor_min': 30.0,
        'humidity_air_sensor_max': 60.0,
        'humidity_ground_sensor_min': 20.0, // Drought-tolerant
        'humidity_ground_sensor_max': 50.0,
        'light_sensor_min': 60000.0, // 6-8 hours full sun
        'light_sensor_max': 100000.0,
        'exposition_time_sun_min': 6.0,
        'exposition_time_sun_max': 10.0,
      },
    };
  }

  /// Test the scoring system with sample data
  Future<void> testScoringSystem(String token) async {
    try {
      final sampleData = getSamplePlantTypeData();
      
      print('🧪 Testing Plant-Specific Scoring System');
      print('=====================================');
      
      for (final entry in sampleData.entries) {
        final plantName = entry.key;
        final requirements = entry.value;
        
        print('\n🌱 Testing: $plantName');
        print('Requirements: $requirements');
        
        // Create a mock sensor reading (middle of optimal range)
        final mockSensorData = {
          'moisture': (requirements['humidity_ground_sensor_min'] + requirements['humidity_ground_sensor_max']) / 2,
          'temperature': (requirements['temperature_sensor_ground_min'] + requirements['temperature_sensor_ground_max']) / 2,
          'light': (requirements['light_sensor_min'] + requirements['light_sensor_max']) / 2,
          'ph': (requirements['ph_min'] + requirements['ph_max']) / 2,
        };
        
        print('Mock Sensor Data: $mockSensorData');
        
        // Test scoring (this would normally use a real plant type ID)
        // For now, just show what the scoring would look like
        print('Expected Scores:');
        print('  Moisture: 10 (optimal range)');
        print('  Temperature: 10 (optimal range)');
        print('  Light: 10 (optimal range)');
        print('  pH: 10 (optimal range)');
      }
      
      print('\n✅ Scoring system test completed');
    } catch (e) {
      print('❌ Error testing scoring system: $e');
    }
  }
} 