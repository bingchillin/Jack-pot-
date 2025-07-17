import 'dart:convert';
import 'package:http/http.dart' as http;
import '../app_config.dart';
import '../models/plant_care_score.dart';
import '../models/object_profile.dart';

class PlantCareScoreService {
  final String baseUrl = AppConfig.baseUrl;

  // Get daily score for a plant
  Future<PlantCareScore?> getDailyScore(int plantId, DateTime date, String token) async {
    try {
      final dateString = date.toIso8601String().split('T')[0]; // YYYY-MM-DD format
      final uri = Uri.parse('$baseUrl/plant-care-scores/plant/$plantId/daily/$dateString');
      
      print('🔍 getDailyScore API call:');
      print('   Plant ID: $plantId');
      print('   Date: $date');
      print('   Date string: $dateString');
      print('   URL: $uri');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('   Response status: ${response.statusCode}');
      print('   Response body length: ${response.body.length}');
      if (response.body.isNotEmpty) {
        print('   Response body preview: ${response.body.substring(0, response.body.length > 100 ? 100 : response.body.length)}...');
      }

      if (response.statusCode == 200) {
        // Check if response body is empty
        if (response.body.isEmpty || response.body.trim() == '') {
          print('   Empty response body, returning null');
          return null; // No score for this date
        }
        
        final data = json.decode(response.body);
        final score = data != null ? PlantCareScore.fromJson(data) : null;
        print('   Score parsed: ${score != null}');
        return score;
      } else if (response.statusCode == 404 || response.statusCode == 204) {
        print('   No score found (${response.statusCode})');
        return null; // No score for this date
      } else {
        print('   Error response: ${response.statusCode} - ${response.body}');
        throw Exception('Failed to get daily score: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error in getDailyScore: $e');
      // If it's a JSON parsing error due to empty response, return null
      if (e.toString().contains('Unexpected end of input')) {
        print('   JSON parsing error due to empty response');
        return null; // No score for this date
      }
      throw Exception('Error getting daily score: $e');
    }
  }

  // Get weekly scores for a plant
  Future<List<PlantCareScore>> getWeeklyScores(int plantId, DateTime weekStart, String token) async {
    try {
      final weekStartString = weekStart.toIso8601String().split('T')[0];
      final uri = Uri.parse('$baseUrl/plant-care-scores/plant/$plantId/weekly?weekStart=$weekStartString');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        // Check if response body is empty
        if (response.body.isEmpty || response.body.trim() == '') {
          return []; // No scores for this week
        }
        
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => PlantCareScore.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get weekly scores: ${response.statusCode}');
      }
    } catch (e) {
      // If it's a JSON parsing error due to empty response, return empty list
      if (e.toString().contains('Unexpected end of input')) {
        return []; // No scores for this week
      }
      throw Exception('Error getting weekly scores: $e');
    }
  }

  // Get monthly scores for a plant
  Future<List<PlantCareScore>> getMonthlyScores(int plantId, int year, int month, String token) async {
    try {
      final uri = Uri.parse('$baseUrl/plant-care-scores/plant/$plantId/monthly?year=$year&month=$month');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => PlantCareScore.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get monthly scores: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting monthly scores: $e');
    }
  }

  // Get scores for a date range
  Future<List<PlantCareScore>> getScoresByRange(int plantId, DateTime startDate, DateTime endDate, String token) async {
    try {
      final startDateString = startDate.toIso8601String().split('T')[0];
      final endDateString = endDate.toIso8601String().split('T')[0];
      final uri = Uri.parse('$baseUrl/plant-care-scores/plant/$plantId/range?startDate=$startDateString&endDate=$endDateString');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        // Check if response body is empty
        if (response.body.isEmpty || response.body.trim() == '') {
          return []; // No scores for this range
        }
        
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => PlantCareScore.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get scores by range: ${response.statusCode}');
      }
    } catch (e) {
      // If it's a JSON parsing error due to empty response, return empty list
      if (e.toString().contains('Unexpected end of input')) {
        return []; // No scores for this range
      }
      throw Exception('Error getting scores by range: $e');
    }
  }

  // Calculate daily score from sensor data
  Future<DailyScoreCalculation> calculateDailyScore(int plantId, Map<String, dynamic> sensorData, String token) async {
    try {
      final uri = Uri.parse('$baseUrl/plant-care-scores/plant/$plantId/calculate-daily');
      
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(sensorData),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return DailyScoreCalculation.fromJson(data);
      } else {
        throw Exception('Failed to calculate daily score: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error calculating daily score: $e');
    }
  }

  // Calculate weekly score from daily scores
  Future<WeeklyScoreCalculation> calculateWeeklyScore(int plantId, List<PlantCareScore> dailyScores, String token) async {
    try {
      final uri = Uri.parse('$baseUrl/plant-care-scores/plant/$plantId/calculate-weekly');
      
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(dailyScores.map((score) => score.toJson()).toList()),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return WeeklyScoreCalculation.fromJson(data);
      } else {
        throw Exception('Failed to calculate weekly score: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error calculating weekly score: $e');
    }
  }

  // Create a new plant care score
  Future<PlantCareScore> createScore(PlantCareScore score, String token) async {
    try {
      final uri = Uri.parse('$baseUrl/plant-care-scores');
      final requestBody = score.toJson();
      
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(requestBody),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return PlantCareScore.fromJson(data);
      } else {
        throw Exception('Failed to create score: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error creating score: $e');
    }
  }

  // Calculate and save daily score for a plant
  Future<PlantCareScore> calculateAndSaveDailyScore(ObjectProfile plant, String token) async {
    try {
      // Prepare sensor data
      final sensorData = {
        'humidityGroundSensor': plant.humidityGroundSensor,
        'temperatureSensorGround': plant.temperatureSensorGround,
        'lightSensor': plant.lightSensor,
        'phGroundSensor': plant.phGroundSensor,
      };

      // Calculate daily score
      final dailyCalculation = await calculateDailyScore(plant.idObjectProfile, sensorData, token);

      // Create plant care score
      final score = PlantCareScore(
        idPlantCareScore: 0, // Will be set by backend
        idObjectProfile: plant.idObjectProfile,
        scoreDate: DateTime.now(),
        dailyScore: dailyCalculation.dailyScore,
        weeklyScore: 0, // Will be calculated later
        moistureScore: dailyCalculation.moistureScore,
        temperatureScore: dailyCalculation.temperatureScore,
        lightScore: dailyCalculation.lightScore,
        phScore: dailyCalculation.phScore,
        consistencyBonus: dailyCalculation.consistencyBonus,
        improvementBonus: 0, // Will be calculated later
        currentStreak: 0, // Will be calculated by automatic score service
        dailyMessage: dailyCalculation.dailyMessage,
        weeklyMessage: null, // Will be set later
        sensorData: sensorData,
        isPerfectDay: dailyCalculation.isPerfectDay,
        isPerfectWeek: false, // Will be calculated later
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      // Save to backend
      return await createScore(score, token);
    } catch (e) {
      throw Exception('Error calculating and saving daily score: $e');
    }
  }

  // Get current week's start date (Monday)
  DateTime getCurrentWeekStart() {
    final now = DateTime.now();
    final daysFromMonday = now.weekday - 1;
    return DateTime(now.year, now.month, now.day - daysFromMonday);
  }

  // Get current month's start date
  DateTime getCurrentMonthStart() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, 1);
  }

  // Get streak information
  Future<Map<String, dynamic>> getStreakInfo(int plantId, String token) async {
    try {
      final today = DateTime.now();
      final weekStart = getCurrentWeekStart();
      
      // Get last 30 days of scores
      final thirtyDaysAgo = today.subtract(const Duration(days: 30));
      final scores = await getScoresByRange(plantId, thirtyDaysAgo, today, token);
      
      // Calculate streaks
      int dailyStreak = 0;
      int perfectStreak = 0;
      int weeklyStreak = 0;
      
      // Daily streak (consecutive days with 20+ points)
      for (int i = 0; i < scores.length; i++) {
        final score = scores[i];
        if (score.dailyScore >= 20) {
          dailyStreak++;
        } else {
          break;
        }
      }
      
      // Perfect streak (consecutive days with 25+ points)
      for (int i = 0; i < scores.length; i++) {
        final score = scores[i];
        if (score.dailyScore >= 25) {
          perfectStreak++;
        } else {
          break;
        }
      }
      
      // Weekly streak (consecutive weeks with 140+ points)
      // This would need more complex logic based on weekly scores
      
      return {
        'dailyStreak': dailyStreak,
        'perfectStreak': perfectStreak,
        'weeklyStreak': weeklyStreak,
        'totalScores': scores.length,
      };
    } catch (e) {
      throw Exception('Error getting streak info: $e');
    }
  }
} 