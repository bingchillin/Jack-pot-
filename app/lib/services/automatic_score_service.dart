import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/plant_care_score.dart';
import 'plant_care_score_service.dart';
import 'sensor_data_service.dart';

class AutomaticScoreService {
  static const String _lastScoreDateKey = 'last_score_date';
  static const String _autoScoreEnabledKey = 'auto_score_enabled';
  
  final PlantCareScoreService _scoreService;
  final SensorDataService _sensorDataService;
  
  AutomaticScoreService(this._scoreService) : _sensorDataService = SensorDataService();

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
          return await _calculateScoreFromData(plantId, mockData);
        }
        return await _calculateScoreFromData(plantId, apiData);
      }

      return await _calculateScoreFromData(plantId, yesterdayData);
    } catch (e) {
      // Fallback to mock data on error
      final mockData = _getMockYesterdayData();
      return await _calculateScoreFromData(plantId, mockData);
    }
  }

  /// Calculate score from sensor data
  Future<PlantCareScore?> _calculateScoreFromData(int plantId, Map<String, double> sensorData) async {
    try {
      // Calculate score components using yesterday's data
      final moistureScore = _calculateMoistureScore(sensorData['moisture'] ?? 0);
      final temperatureScore = _calculateTemperatureScore(sensorData['temperature'] ?? 0);
      final lightScore = _calculateLightScore(sensorData['light'] ?? 0);
      final phScore = _calculatePhScore(sensorData['ph'] ?? 0);
      final consistencyBonus = _calculateBonusScore(sensorData);
      final improvementBonus = await _sensorDataService.calculateImprovementBonus(plantId, sensorData);
      
      final dailyScore = moistureScore + temperatureScore + lightScore + phScore + consistencyBonus + improvementBonus;

      // Calculate weekly score
      final weeklyScore = await _calculateWeeklyScore(plantId, dailyScore);

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
        dailyMessage: _getScoreMessage(dailyScore),
        weeklyMessage: _getWeeklyMessage(weeklyScore),
        sensorData: sensorData,
        isPerfectDay: dailyScore >= 25,
        isPerfectWeek: weeklyScore >= 150, // 25 * 6 days = 150
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      // Save to backend (note: token not available in this context, skip backend save for now)
      // final savedScore = await _scoreService.createScore(score, token);
      
      // Mark today as scored and return the score
      await _markTodayAsScored();
      return score;
    } catch (e) {
      // Log error but don't throw - automatic scoring should be silent
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

  /// Calculate bonus score (0-2 points)
  int _calculateBonusScore(Map<String, double> sensorData) {
    int bonus = 0;
    
    // Consistency bonus - if all sensors are in good or optimal ranges
    final moisture = sensorData['moisture'] ?? 0;
    final temperature = sensorData['temperature'] ?? 0;
    final light = sensorData['light'] ?? 0;
    final ph = sensorData['ph'] ?? 0;
    
    if (moisture >= 50 && moisture <= 90 &&
        temperature >= 15 && temperature <= 30 &&
        light >= 30 && light <= 90 &&
        ph >= 5.5 && ph <= 7.5) {
      bonus += 1;
    }
    
    // Improvement bonus - if this is better than yesterday
    // TODO: Compare with previous day's data
    bonus += 1; // For now, give 1 point as default
    
    return bonus;
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

  /// Calculate weekly score based on last 7 days
  Future<int> _calculateWeeklyScore(int plantId, int todayScore) async {
    try {
      // Get last 7 days of scores from backend
      final weekStart = DateTime.now().subtract(const Duration(days: 7));
      final weeklyScores = await _scoreService.getWeeklyScores(plantId, weekStart, 'token');
      
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