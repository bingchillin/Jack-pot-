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

  /// Get plant types that have complete requirements defined
  Future<List<PlantTypeRequirements>> getPlantTypesWithRequirements(String token) async {
    try {
      final allPlantTypes = await getAllPlantTypes(token);
      return allPlantTypes.where((plantType) => plantType.hasCompleteRequirements).toList();
    } catch (e) {
      throw Exception('Error getting plant types with requirements: $e');
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

      return {
        'moisture': plantType.calculateSensorScore('moisture', sensorData['moisture'] ?? 0),
        'temperature': plantType.calculateSensorScore('temperature', sensorData['temperature'] ?? 0),
        'light': plantType.calculateSensorScore('light', sensorData['light'] ?? 0),
        'ph': plantType.calculateSensorScore('ph', sensorData['ph'] ?? 0),
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
} 