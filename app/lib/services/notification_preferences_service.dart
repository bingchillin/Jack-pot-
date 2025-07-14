import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../app_config.dart';

class NotificationPreferencesService {
  static String get baseUrl => AppConfig.baseUrl;
  
  // SharedPreferences keys
  static const String _prefsKey = 'notification_preferences';
  
  // Default preferences
  static const Map<String, bool> _defaultPreferences = {
    'plant_care_notifications': true,
    'watering_reminders': true,
    'light_alerts': true,
    'temperature_alerts': true,
    'nutrient_alerts': true,
    'health_checkups': true,
    'system_updates': false,
    'comment_likes': true,
    'comment_mentions': true,
    'comment_replies': true,
  };

  /// Load notification preferences from SharedPreferences
  Future<Map<String, bool>> loadPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? preferencesJson = prefs.getString(_prefsKey);
      
      if (preferencesJson != null) {
        final Map<String, dynamic> savedPrefs = json.decode(preferencesJson);
        // Convert dynamic values to bool and merge with defaults
        final Map<String, bool> preferences = {};
        for (final entry in _defaultPreferences.entries) {
          preferences[entry.key] = savedPrefs[entry.key] as bool? ?? entry.value;
        }
        return preferences;
      }
    } catch (e) {
      print('Error loading notification preferences: $e');
    }
    
    // Return default preferences if loading fails
    return Map.from(_defaultPreferences);
  }

  /// Save notification preferences to SharedPreferences
  Future<bool> savePreferences(Map<String, bool> preferences) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String preferencesJson = json.encode(preferences);
      return await prefs.setString(_prefsKey, preferencesJson);
    } catch (e) {
      print('Error saving notification preferences: $e');
      return false;
    }
  }

  /// Save preferences to backend
  Future<bool> savePreferencesToBackend(Map<String, bool> preferences, String token, int personId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/person-parameters/notification-preferences'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'personId': personId,
          'preferences': preferences,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error saving preferences to backend: $e');
      return false;
    }
  }

  /// Load preferences from backend
  Future<Map<String, bool>?> loadPreferencesFromBackend(String token, int personId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/person-parameters/notification-preferences/$personId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final Map<String, bool> preferences = {};
        
        // Convert the response to our preference format
        for (final entry in _defaultPreferences.entries) {
          preferences[entry.key] = data[entry.key] as bool? ?? entry.value;
        }
        
        return preferences;
      }
    } catch (e) {
      print('Error loading preferences from backend: $e');
    }
    
    return null;
  }

  /// Check if a specific notification type is enabled
  Future<bool> isNotificationEnabled(String notificationType) async {
    final preferences = await loadPreferences();
    return preferences[notificationType] ?? _defaultPreferences[notificationType] ?? true;
  }

  /// Get all notification types
  List<String> getNotificationTypes() {
    return _defaultPreferences.keys.toList();
  }

  /// Get default preferences
  Map<String, bool> getDefaultPreferences() {
    return Map.from(_defaultPreferences);
  }
} 