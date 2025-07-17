import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/plant_care_score.dart';
import 'plant_care_score_service.dart';
import 'sensor_data_service.dart';
import 'object_profile_service.dart';
import 'plant_type_requirements_service.dart';
import '../models/object_profile.dart';

class AutomaticScoreService {
  static const String _lastScoreDateKey = 'last_score_date';
  static const String _autoScoreEnabledKey = 'auto_score_enabled';
  static const String _lastAutoScoreTimeKey = 'last_auto_score_time';
  static const String _lastDataCollectionDateKey = 'last_data_collection_date';
  
  final PlantCareScoreService _scoreService;
  final SensorDataService _sensorDataService;
  final ObjectProfileService _objectProfileService;
  final PlantTypeRequirementsService _plantTypeService;
  
  AutomaticScoreService(this._scoreService) 
    : _sensorDataService = SensorDataService(),
      _objectProfileService = ObjectProfileService(),
      _plantTypeService = PlantTypeRequirementsService();

  /// Check if we should collect end-of-day data
  Future<bool> shouldCollectEndOfDayData() async {
    final prefs = await SharedPreferences.getInstance();
    final autoScoreEnabled = prefs.getBool(_autoScoreEnabledKey) ?? true;
    
    if (!autoScoreEnabled) return false;
    
    final lastCollectionDate = prefs.getString(_lastDataCollectionDateKey);
    final today = DateTime.now().toIso8601String().split('T')[0];
    
    return lastCollectionDate != today;
  }

  /// Collect end-of-day sensor data and calculate scores
  Future<void> collectEndOfDayDataAndCalculateScores(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final today = DateTime.now().toIso8601String().split('T')[0];
      
      // Check if we already collected data today
      final lastCollectionDate = prefs.getString(_lastDataCollectionDateKey);
      if (lastCollectionDate == today) {
        return;
      }
      
      // Get all plants
      final plants = await _objectProfileService.fetchProfilesAll(token);
      
      for (final plant in plants) {
        try {
          // Collect current sensor data (end-of-day snapshot)
          final currentSensorData = await _collectCurrentSensorData(plant);
          
          // Store the end-of-day data
          await _sensorDataService.storeSensorData(plant.idObjectProfile, currentSensorData);
          
          // Calculate score based on this data
          final score = await _calculateScoreFromData(plant.idObjectProfile, currentSensorData, token);
          
          if (score != null) {
            // print('✅ Calculated end-of-day score for plant ${plant.idObjectProfile}: ${score.dailyScore} points');
          }
        } catch (e) {
          // print('❌ Error processing plant ${plant.idObjectProfile}: $e');
        }
      }
      
      // Mark today as collected
      await prefs.setString(_lastDataCollectionDateKey, today);
    } catch (e) {
      // print('❌ Error in end-of-day data collection: $e');
    }
  }

  /// Collect current sensor data for a plant
  Future<Map<String, double>> _collectCurrentSensorData(ObjectProfile plant) async {
    // For now, use the plant's current sensor values
    // In a real implementation, this would read from actual sensors
    return {
      'moisture': plant.humidityGroundSensor?.toDouble() ?? 70.0,
      'temperature': plant.temperatureSensorGround?.toDouble() ?? 22.0,
      'light': plant.lightSensor?.toDouble() ?? 65.0,
      'ph': plant.phGroundSensor?.toDouble() ?? 6.5,
    };
  }

  /// Get yesterday's score for display (used by popup)
  Future<PlantCareScore?> getYesterdayScore(int plantId, String token) async {
    try {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      print('🔍 getYesterdayScore for plant $plantId:');
      print('   Yesterday date: $yesterday');
      print('   Yesterday ISO: ${yesterday.toIso8601String()}');
      
      final score = await _scoreService.getDailyScore(plantId, yesterday, token);
      
      print('   Score found: ${score != null}');
      if (score != null) {
        print('   Score date: ${score.scoreDate}');
        print('   Score points: ${score.dailyScore}');
      }
      
      if (score != null) {
        // print('✅ Found yesterday\'s score for plant $plantId: ${score.dailyScore} points');
        return score;
      } else {
        // print('ℹ️ No yesterday\'s score found for plant $plantId');
        return null;
      }
    } catch (e) {
      print('❌ Error in getYesterdayScore: $e');
      // print('❌ Error getting yesterday\'s score: $e');
      return null;
    }
  }

  /// Check if automatic scoring should be triggered for today
  Future<bool> shouldCalculateScore() async {
    final prefs = await SharedPreferences.getInstance();
    final autoScoreEnabled = prefs.getBool(_autoScoreEnabledKey) ?? true;
    
    if (!autoScoreEnabled) return false;
    
    final lastScoreDate = prefs.getString(_lastScoreDateKey);
    final today = DateTime.now().toIso8601String().split('T')[0];
    
    return lastScoreDate != today;
  }

  /// Calculate and save automatic daily score using yesterday's sensor data
  Future<PlantCareScore?> calculateAutomaticScore(int plantId, String token) async {
    try {
      // Get yesterday's sensor data for scoring
      final yesterdayData = await _sensorDataService.getYesterdaySensorData(plantId);
      
      if (yesterdayData == null) {
        // No yesterday data available, try to get from API or use mock data
        final apiData = await _getYesterdaySensorDataFromAPI(plantId, token);
        if (apiData == null) {
          // Use mock data as fallback
          final mockData = _getMockYesterdayData();
          await _sensorDataService.storeSensorData(plantId, mockData);
          return await _calculateScoreFromData(plantId, mockData, token);
        }
        return await _calculateScoreFromData(plantId, apiData, token);
      }

      return await _calculateScoreFromData(plantId, yesterdayData, token);
    } catch (e) {
      // Fallback to mock data on error
      final mockData = _getMockYesterdayData();
      return await _calculateScoreFromData(plantId, mockData, token);
    }
  }

  /// Calculate and save automatic scores for all plants
  Future<void> calculateAndSaveAllPlantScores(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final today = DateTime.now().toIso8601String().split('T')[0];
      final lastAutoScoreTime = prefs.getString(_lastAutoScoreTimeKey);
      
      // Only run once per day
      if (lastAutoScoreTime == today) {
        return;
      }
      
      // Get all plants for the current user
      final plants = await _objectProfileService.fetchProfilesAll(token);
      
      for (final plant in plants) {
        try {
          // Check if score already exists for today
          final todayScore = await _scoreService.getDailyScore(
            plant.idObjectProfile, 
            DateTime.now(), 
            token
          );
          
          if (todayScore == null) {
            // Calculate and save score for this plant
            final score = await calculateAutomaticScore(plant.idObjectProfile, token);
            if (score != null) {
              // print('✅ Calculated and saved score for plant ${plant.idObjectProfile}: ${score.dailyScore} points');
            } else {
              // print('⚠️ Failed to calculate score for plant ${plant.idObjectProfile}');
            }
          } else {
            // print('ℹ️ Score already exists for plant ${plant.idObjectProfile} today');
          }
        } catch (e) {
          // Continue with other plants if one fails
          // print('❌ Error calculating score for plant ${plant.idObjectProfile}: $e');
        }
      }
      
      // Mark today as processed
      await prefs.setString(_lastAutoScoreTimeKey, today);
    } catch (e) {
      // print('Error in calculateAndSaveAllPlantScores: $e');
    }
  }

  /// Calculate score from sensor data and save to database
  Future<PlantCareScore?> _calculateScoreFromData(int plantId, Map<String, double> sensorData, String token) async {
    try {
      // Get plant type ID for plant-specific scoring
      final plant = await _objectProfileService.fetchObjectProfileDetails(plantId, token);
      final plantTypeId = plant.plantType?.idPlantType;
      
      // Calculate score components using plant-specific requirements
      Map<String, int> scores;
      if (plantTypeId != null) {
        scores = await _plantTypeService.calculatePlantScores(plantTypeId, sensorData, token);
      } else {
        // Fallback to default scoring if no plant type
        scores = {
          'moisture': _calculateMoistureScore(sensorData['moisture'] ?? 0),
          'temperature': _calculateTemperatureScore(sensorData['temperature'] ?? 0),
          'light': _calculateLightScore(sensorData['light'] ?? 0),
          'ph': _calculatePhScore(sensorData['ph'] ?? 0),
        };
      }
      
      final moistureScore = scores['moisture'] ?? 0;
      final temperatureScore = scores['temperature'] ?? 0;
      final lightScore = scores['light'] ?? 0;
      final phScore = scores['ph'] ?? 0;
      
      // Calculate streak and consistency bonus
      final streakInfo = await _calculateStreakAndBonus(plantId, token);
      final consistencyBonus = streakInfo['consistencyBonus'] as int;
      final currentStreak = streakInfo['currentStreak'] as int;
      
      final improvementBonus = await _sensorDataService.calculateImprovementBonus(plantId, sensorData);
      
      final dailyScore = moistureScore + temperatureScore + lightScore + phScore + consistencyBonus + improvementBonus;

      // Calculate weekly score
      final weeklyScore = await _calculateWeeklyScore(plantId, dailyScore, token);

      // Create score object
      final score = PlantCareScore(
        idPlantCareScore: 0, // Will be set by backend
        idObjectProfile: plantId,
        scoreDate: DateTime.now(),
        dailyScore: dailyScore,
        weeklyScore: weeklyScore,
        moistureScore: moistureScore,
        temperatureScore: temperatureScore,
        lightScore: lightScore,
        phScore: phScore,
        consistencyBonus: consistencyBonus,
        improvementBonus: improvementBonus,
        currentStreak: currentStreak,
        dailyMessage: _getScoreMessage(dailyScore),
        weeklyMessage: _getWeeklyMessage(weeklyScore),
        sensorData: sensorData,
        isPerfectDay: dailyScore >= 25,
        isPerfectWeek: weeklyScore >= 150, // 25 * 6 days = 150
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      // Save to backend
      final savedScore = await _scoreService.createScore(score, token);
      
      // Mark today as scored and return the score
      await _markTodayAsScored();
      return savedScore;
    } catch (e) {
      // Log error but don't throw - automatic scoring should be silent
      // print('Error calculating score from data: $e');
      return null;
    }
  }

  /// Get yesterday's sensor data from API
  Future<Map<String, double>?> _getYesterdaySensorDataFromAPI(int plantId, String token) async {
    try {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      final score = await _scoreService.getDailyScore(plantId, yesterday, token);
      
      if (score?.sensorData != null) {
        // Extract sensor data from the stored score
        final data = score!.sensorData as Map<String, dynamic>;
        return {
          'moisture': (data['moisture'] ?? 0).toDouble(),
          'temperature': (data['temperature'] ?? 0).toDouble(),
          'light': (data['light'] ?? 0).toDouble(),
          'ph': (data['ph'] ?? 0).toDouble(),
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Get mock yesterday data for fallback
  Map<String, double> _getMockYesterdayData() {
    return {
      'moisture': 68.0, // Yesterday's moisture
      'temperature': 21.5, // Yesterday's temperature
      'light': 62.0, // Yesterday's light exposure
      'ph': 6.3, // Yesterday's pH
    };
  }

  /// Calculate moisture score (0-10 points)
  int _calculateMoistureScore(double moisture) {
    if (moisture >= 60 && moisture <= 80) return 10; // Optimal range
    if (moisture >= 50 && moisture <= 90) return 8;  // Good range
    if (moisture >= 40 && moisture <= 95) return 6;  // Acceptable range
    if (moisture >= 30 && moisture <= 100) return 4; // Poor range
    return 2; // Critical range
  }

  /// Calculate temperature score (0-8 points)
  int _calculateTemperatureScore(double temperature) {
    if (temperature >= 18 && temperature <= 26) return 8;  // Optimal range
    if (temperature >= 15 && temperature <= 30) return 6;  // Good range
    if (temperature >= 10 && temperature <= 35) return 4;  // Acceptable range
    if (temperature >= 5 && temperature <= 40) return 2;   // Poor range
    return 0; // Critical range
  }

  /// Calculate light score (0-6 points)
  int _calculateLightScore(double light) {
    if (light >= 50 && light <= 80) return 6;  // Optimal range
    if (light >= 30 && light <= 90) return 5;  // Good range
    if (light >= 20 && light <= 95) return 4;  // Acceptable range
    if (light >= 10 && light <= 100) return 2; // Poor range
    return 1; // Critical range
  }

  /// Calculate pH score (0-4 points)
  int _calculatePhScore(double ph) {
    if (ph >= 6.0 && ph <= 7.0) return 4;   // Optimal range
    if (ph >= 5.5 && ph <= 7.5) return 3;   // Good range
    if (ph >= 5.0 && ph <= 8.0) return 2;   // Acceptable range
    if (ph >= 4.5 && ph <= 8.5) return 1;   // Poor range
    return 0; // Critical range
  }

  /// Calculate streak and consistency bonus
  Future<Map<String, int>> _calculateStreakAndBonus(int plantId, String token) async {
    try {
      // Get the last 10 days of scores to check streak (extended from 3 days)
      final tenDaysAgo = DateTime.now().subtract(const Duration(days: 10));
      final recentScores = await _scoreService.getScoresByRange(plantId, tenDaysAgo, DateTime.now(), token);
      
      int currentStreak = 0;
      int consistencyBonus = 0;
      
      // Lower threshold for "good score" (was 20, now 15)
      final goodScoreThreshold = 15;
      
      // Sort scores by date (most recent first)
      recentScores.sort((a, b) => b.scoreDate.compareTo(a.scoreDate));
      
      // Simplified streak calculation
      int consecutiveGoodDays = 0;
      DateTime? lastGoodDate;
      
      for (final score in recentScores) {
        final scoreDate = DateTime(score.scoreDate.year, score.scoreDate.month, score.scoreDate.day);
        
        if (score.dailyScore >= goodScoreThreshold) {
          if (lastGoodDate == null) {
            // First good score
            consecutiveGoodDays = 1;
            lastGoodDate = scoreDate;
          } else {
            // Check if this is the next consecutive day
            final expectedDate = lastGoodDate.add(const Duration(days: 1));
            if (scoreDate.isAtSameMomentAs(expectedDate)) {
              // Consecutive day
              consecutiveGoodDays++;
              lastGoodDate = scoreDate;
            } else if (scoreDate.isAfter(expectedDate)) {
              // Gap in days - reset streak
              consecutiveGoodDays = 1;
              lastGoodDate = scoreDate;
            }
            // If scoreDate is before expectedDate, skip (out of order)
          }
        } else {
          // Bad score - reset streak
          consecutiveGoodDays = 0;
          lastGoodDate = null;
        }
      }
      
      // Cap streak at 3 days maximum
      currentStreak = consecutiveGoodDays.clamp(0, 3);
      
      // Award consistency bonus only if streak is exactly 3
      if (currentStreak == 3) {
        consistencyBonus = 10;
      }
      
      // print('🌱 Plant $plantId: Current streak = $currentStreak, Consistency bonus = $consistencyBonus');
      
      return {
        'currentStreak': currentStreak,
        'consistencyBonus': consistencyBonus,
      };
    } catch (e) {
      // print('❌ Error calculating streak: $e');
      // Return default values on error
      return {
        'currentStreak': 0,
        'consistencyBonus': 0,
      };
    }
  }

  /// Mark today as scored to prevent duplicate calculations
  Future<void> _markTodayAsScored() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().split('T')[0];
    await prefs.setString(_lastScoreDateKey, today);
  }

  /// Enable or disable automatic scoring
  Future<void> setAutoScoreEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_autoScoreEnabledKey, enabled);
  }

  /// Check if automatic scoring is enabled
  Future<bool> isAutoScoreEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_autoScoreEnabledKey) ?? true;
  }

  /// Reset the last score date (for testing or manual recalculation)
  Future<void> resetLastScoreDate() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_lastScoreDateKey);
  }

  /// Reset the last auto score time (for testing)
  Future<void> resetLastAutoScoreTime() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_lastAutoScoreTimeKey);
  }

  /// Reset the last data collection date (for testing)
  Future<void> resetLastDataCollectionDate() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_lastDataCollectionDateKey);
  }

  /// Calculate weekly score based on last 7 days
  Future<int> _calculateWeeklyScore(int plantId, int todayScore, String token) async {
    try {
      // Get last 7 days of scores from backend
      final weekStart = DateTime.now().subtract(const Duration(days: 7));
      final weeklyScores = await _scoreService.getWeeklyScores(plantId, weekStart, token);
      
      // Add today's score
      final allScores = [...weeklyScores.map((score) => score.dailyScore), todayScore];
      
      // Calculate total of last 7 days
      if (allScores.length > 7) {
        allScores.removeRange(0, allScores.length - 7);
      }
      
      final total = allScores.fold<int>(0, (sum, score) => sum + score);
      return total;
    } catch (e) {
      // If we can't get historical data, just return today's score
      return todayScore;
    }
  }

  /// Get weekly message based on weekly score
  String _getWeeklyMessage(int weeklyScore) {
    final average = weeklyScore / 7;
    
    if (average >= 25) return "Outstanding week! You're a plant care master!";
    if (average >= 20) return "Great week! Your consistency is impressive!";
    if (average >= 15) return "Good week! Keep up the steady care!";
    if (average >= 10) return "Decent week! Room for improvement.";
    if (average >= 5) return "Challenging week! Let's do better next week.";
    return "Difficult week! Your plants need more attention.";
  }

  /// Get score message based on total score
  String _getScoreMessage(int score) {
    if (score >= 25) return "Excellent! Your plant care is outstanding!";
    if (score >= 20) return "Great job! Keep up the good work!";
    if (score >= 15) return "Good work! Your plant is doing well!";
    if (score >= 10) return "Not bad! There's room for improvement.";
    if (score >= 5) return "Needs attention! Check your plant care routine.";
    return "Critical issues! Immediate care required!";
  }
}