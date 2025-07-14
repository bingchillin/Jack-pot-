import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/plant_care_score.dart';
import 'plant_care_score_service.dart';

class AutomaticScoreService {
  static const String _lastScoreDateKey = 'last_score_date';
  static const String _autoScoreEnabledKey = 'auto_score_enabled';
  
  final PlantCareScoreService _scoreService;
  
  AutomaticScoreService(this._scoreService);

  /// Check if automatic scoring should be triggered for today
  Future<bool> shouldCalculateScore() async {
    final prefs = await SharedPreferences.getInstance();
    final autoScoreEnabled = prefs.getBool(_autoScoreEnabledKey) ?? true;
    
    if (!autoScoreEnabled) return false;
    
    final lastScoreDate = prefs.getString(_lastScoreDateKey);
    final today = DateTime.now().toIso8601String().split('T')[0];
    
    return lastScoreDate != today;
  }

  /// Calculate and save automatic daily score
  Future<PlantCareScore?> calculateAutomaticScore(int plantId, String token) async {
    try {
      // Get latest sensor data for the plant
      final sensorData = await _getLatestSensorData(plantId);
      
      if (sensorData == null) {
        // No sensor data available, skip calculation
        return null;
      }

      // Calculate score components
      final moistureScore = _calculateMoistureScore(sensorData['moisture'] ?? 0);
      final temperatureScore = _calculateTemperatureScore(sensorData['temperature'] ?? 0);
      final lightScore = _calculateLightScore(sensorData['light'] ?? 0);
      final phScore = _calculatePhScore(sensorData['ph'] ?? 0);
      final consistencyBonus = _calculateBonusScore(sensorData);
      
      final totalScore = moistureScore + temperatureScore + lightScore + phScore + consistencyBonus;

      // Create score object
      final score = PlantCareScore(
        idPlantCareScore: 0, // Will be set by backend
        idObjectProfile: plantId,
        scoreDate: DateTime.now(),
        dailyScore: totalScore,
        weeklyScore: 0, // Will be calculated later
        moistureScore: moistureScore,
        temperatureScore: temperatureScore,
        lightScore: lightScore,
        phScore: phScore,
        consistencyBonus: consistencyBonus,
        improvementBonus: 0, // Will be calculated later
        dailyMessage: _getScoreMessage(totalScore),
        weeklyMessage: null, // Will be set later
        sensorData: sensorData,
        isPerfectDay: totalScore >= 25,
        isPerfectWeek: false, // Will be calculated later
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      // Save to backend
      final savedScore = await _scoreService.createScore(score, token);
      
      if (savedScore != null) {
        // Mark today as scored
        await _markTodayAsScored();
        return savedScore;
      }
      
      return null;
    } catch (e) {
      // Log error but don't throw - automatic scoring should be silent
      return null;
    }
  }

  /// Get latest sensor data for a plant
  Future<Map<String, double>?> _getLatestSensorData(int plantId) async {
    try {
      // This would typically fetch from your sensor data service
      // For now, we'll simulate sensor data
      // TODO: Replace with actual sensor data fetching
      
      // Simulate sensor readings (0-100 scale)
      return {
        'moisture': 75.0, // 75% moisture
        'temperature': 22.0, // 22°C
        'light': 65.0, // 65% light exposure
        'ph': 6.5, // pH 6.5
      };
    } catch (e) {
      return null;
    }
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