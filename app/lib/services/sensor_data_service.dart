import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class SensorDataService {
  static const String _sensorDataKey = 'sensor_data_history';
  static const String _lastSensorDataKey = 'last_sensor_data';
  
  /// Store sensor data for a specific plant and date
  Future<void> storeSensorData(int plantId, Map<String, double> sensorData) async {
    final prefs = await SharedPreferences.getInstance();
    
    // Store current data as last data
    await prefs.setString(_lastSensorDataKey, jsonEncode({
      'plantId': plantId,
      'data': sensorData,
      'timestamp': DateTime.now().toIso8601String(),
    }));
    
    // Store in history
    final historyKey = '${_sensorDataKey}_$plantId';
    final existingHistory = prefs.getString(historyKey);
    final history = existingHistory != null ? jsonDecode(existingHistory) as List : [];
    
    // Add new entry
    history.add({
      'date': DateTime.now().toIso8601String().split('T')[0],
      'data': sensorData,
      'timestamp': DateTime.now().toIso8601String(),
    });
    
    // Keep only last 30 days
    if (history.length > 30) {
      history.removeRange(0, history.length - 30);
    }
    
    await prefs.setString(historyKey, jsonEncode(history));
  }
  
  /// Get yesterday's sensor data for a plant
  Future<Map<String, double>?> getYesterdaySensorData(int plantId) async {
    final prefs = await SharedPreferences.getInstance();
    final historyKey = '${_sensorDataKey}_$plantId';
    final existingHistory = prefs.getString(historyKey);
    
    if (existingHistory == null) return null;
    
    final history = jsonDecode(existingHistory) as List;
    final yesterday = DateTime.now().subtract(const Duration(days: 1)).toIso8601String().split('T')[0];
    
    for (final entry in history) {
      if (entry['date'] == yesterday) {
        return Map<String, double>.from(entry['data']);
      }
    }
    
    return null;
  }
  
  /// Get last 7 days of sensor data for weekly analysis
  Future<List<Map<String, double>>> getWeeklySensorData(int plantId) async {
    final prefs = await SharedPreferences.getInstance();
    final historyKey = '${_sensorDataKey}_$plantId';
    final existingHistory = prefs.getString(historyKey);
    
    if (existingHistory == null) return [];
    
    final history = jsonDecode(existingHistory) as List;
    final weekAgo = DateTime.now().subtract(const Duration(days: 7));
    
    final weeklyData = <Map<String, double>>[];
    
    for (final entry in history) {
      final entryDate = DateTime.parse(entry['date']);
      if (entryDate.isAfter(weekAgo)) {
        weeklyData.add(Map<String, double>.from(entry['data']));
      }
    }
    
    return weeklyData;
  }
  
  /// Get the last stored sensor data
  Future<Map<String, double>?> getLastSensorData() async {
    final prefs = await SharedPreferences.getInstance();
    final lastData = prefs.getString(_lastSensorDataKey);
    
    if (lastData == null) return null;
    
    final data = jsonDecode(lastData);
    return Map<String, double>.from(data['data']);
  }
  
  /// Calculate weekly average sensor data
  Future<Map<String, double>> getWeeklyAverage(int plantId) async {
    final weeklyData = await getWeeklySensorData(plantId);
    
    if (weeklyData.isEmpty) {
      // Return current simulated data if no history
      return {
        'moisture': 75.0,
        'temperature': 22.0,
        'light': 65.0,
        'ph': 6.5,
      };
    }
    
    final totals = <String, double>{
      'moisture': 0.0,
      'temperature': 0.0,
      'light': 0.0,
      'ph': 0.0,
    };
    
    for (final data in weeklyData) {
      totals['moisture'] = (totals['moisture'] ?? 0) + (data['moisture'] ?? 0);
      totals['temperature'] = (totals['temperature'] ?? 0) + (data['temperature'] ?? 0);
      totals['light'] = (totals['light'] ?? 0) + (data['light'] ?? 0);
      totals['ph'] = (totals['ph'] ?? 0) + (data['ph'] ?? 0);
    }
    
    final count = weeklyData.length.toDouble();
    return {
      'moisture': (totals['moisture'] ?? 0) / count,
      'temperature': (totals['temperature'] ?? 0) / count,
      'light': (totals['light'] ?? 0) / count,
      'ph': (totals['ph'] ?? 0) / count,
    };
  }
  
  /// Calculate improvement bonus by comparing today vs yesterday
  Future<int> calculateImprovementBonus(int plantId, Map<String, double> todayData) async {
    final yesterdayData = await getYesterdaySensorData(plantId);
    
    if (yesterdayData == null) return 1; // Default bonus if no yesterday data
    
    int improvementCount = 0;
    
    // Check if each metric improved
    if ((todayData['moisture'] ?? 0) > (yesterdayData['moisture'] ?? 0)) improvementCount++;
    if ((todayData['temperature'] ?? 0) > (yesterdayData['temperature'] ?? 0)) improvementCount++;
    if ((todayData['light'] ?? 0) > (yesterdayData['light'] ?? 0)) improvementCount++;
    if ((todayData['ph'] ?? 0) > (yesterdayData['ph'] ?? 0)) improvementCount++;
    
    // Bonus based on number of improvements
    if (improvementCount >= 3) return 2;
    if (improvementCount >= 2) return 1;
    return 0;
  }
  
  /// Clear all stored sensor data (for testing)
  Future<void> clearAllData() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys();
    
    for (final key in keys) {
      if (key.startsWith(_sensorDataKey) || key == _lastSensorDataKey) {
        await prefs.remove(key);
      }
    }
  }
} 