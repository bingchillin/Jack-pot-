import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'automatic_score_service.dart';
import 'plant_care_score_service.dart';
import 'object_profile_service.dart';
import '../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';

class DailyScoreBackgroundService {
  static const String _lastBackgroundScoreDateKey = 'last_background_score_date';
  static const String _backgroundScoreEnabledKey = 'background_score_enabled';
  
  final AutomaticScoreService _autoScoreService;
  final PlantCareScoreService _scoreService;
  
  DailyScoreBackgroundService()
    : _scoreService = PlantCareScoreService(),
      _autoScoreService = AutomaticScoreService(PlantCareScoreService());

  final ObjectProfileService _objectProfileService = ObjectProfileService();

  /// Initialize the background service
  static Future<void> initialize() async {
    final service = DailyScoreBackgroundService();
    await service._checkAndRunDailyScoring();
  }

  /// Check if background scoring is enabled
  Future<bool> isBackgroundScoringEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_backgroundScoreEnabledKey) ?? true;
  }

  /// Enable or disable background scoring
  Future<void> setBackgroundScoringEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_backgroundScoreEnabledKey, enabled);
  }

  /// Check and run daily scoring if needed
  Future<void> _checkAndRunDailyScoring() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final enabled = prefs.getBool(_backgroundScoreEnabledKey) ?? true;
      
      if (!enabled) return;
      
      final today = DateTime.now().toIso8601String().split('T')[0];
      final lastRunDate = prefs.getString(_lastBackgroundScoreDateKey);
      
      // Only run once per day
      if (lastRunDate == today) {
        return;
      }
      
      // Run the daily scoring
      await _runDailyScoring();
      
      // Mark today as processed
      await prefs.setString(_lastBackgroundScoreDateKey, today);
    } catch (e) {
      print('Error in daily score background service: $e');
    }
  }

  /// Run daily scoring for all plants
  Future<void> _runDailyScoring() async {
    try {
      // Get the auth token from shared preferences
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token');
      
      if (token == null) {
        print('No auth token available for background scoring');
        return;
      }
      
      // Calculate and save scores for all plants
      await _autoScoreService.calculateAndSaveAllPlantScores(token);
      
      print('✅ Daily background scoring completed successfully');
    } catch (e) {
      print('❌ Error in daily scoring: $e');
    }
  }

  /// Manually trigger daily scoring (for testing)
  Future<void> triggerDailyScoring(String token) async {
    try {
      await _autoScoreService.calculateAndSaveAllPlantScores(token);
      print('✅ Manual daily scoring triggered successfully');
    } catch (e) {
      print('❌ Error in manual daily scoring: $e');
    }
  }

  /// Reset the last background score date (for testing)
  Future<void> resetLastBackgroundScoreDate() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_lastBackgroundScoreDateKey);
  }

  /// Get the last background score date
  Future<String?> getLastBackgroundScoreDate() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_lastBackgroundScoreDateKey);
  }

  /// Test method to verify the system is working
  Future<void> testSystem(String token) async {
    try {
      print('🧪 Testing automatic scoring system...');
      
      // Test 1: Get all plants
      final plants = await _objectProfileService.fetchProfilesAll(token);
      print('📊 Found ${plants.length} plants');
      
      if (plants.isNotEmpty) {
        final testPlant = plants.first;
        print('🧪 Testing with plant ID: ${testPlant.idObjectProfile}');
        
        // Test 2: Check if today's score exists
        final todayScore = await _scoreService.getDailyScore(
          testPlant.idObjectProfile, 
          DateTime.now(), 
          token
        );
        
        if (todayScore != null) {
          print('✅ Today\'s score already exists: ${todayScore.dailyScore} points');
        } else {
          print('ℹ️ No score for today, will calculate one');
          
          // Test 3: Calculate a score
          final newScore = await _autoScoreService.calculateAutomaticScore(testPlant.idObjectProfile, token);
          if (newScore != null) {
            print('✅ Successfully calculated score: ${newScore.dailyScore} points');
            print('📊 Score breakdown:');
            print('   - Moisture: ${newScore.moistureScore}/10');
            print('   - Temperature: ${newScore.temperatureScore}/8');
            print('   - Light: ${newScore.lightScore}/6');
            print('   - pH: ${newScore.phScore}/4');
            print('   - Bonus: ${newScore.consistencyBonus}/2');
            print('   - Total: ${newScore.dailyScore}/30');
          } else {
            print('❌ Failed to calculate score');
          }
        }
      } else {
        print('⚠️ No plants found to test with');
      }
      
    } catch (e) {
      print('❌ Test failed: $e');
    }
  }
} 