import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;

import '../models/object_profile.dart';
import 'package:jackpote/app_config.dart';

class _CacheEntry {
  final ObjectProfile data;
  final DateTime timestamp;

  _CacheEntry(this.data, this.timestamp);

  bool isExpired(Duration maxAge) {
    return DateTime.now().difference(timestamp) > maxAge;
  }
}

class ObjectProfileService {
  final String baseUrl = AppConfig.baseUrl;
  
  // Cache for plant details with 5 minute expiration
  static final Map<int, _CacheEntry> _plantCache = {};
  static const Duration _cacheExpiration = Duration(minutes: 5);
  
  // Global notification stream for when plant data changes
  static final StreamController<int> _plantUpdateController = StreamController<int>.broadcast();
  static Stream<int> get plantUpdateStream => _plantUpdateController.stream;

  Future<List<ObjectProfile>> fetchProfiles(String personId, String token) async {
    final url = Uri.parse(AppConfig.objectProfilesEndpoint(personId));
    final response = await http.get(url, headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    });

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((json) => ObjectProfile.fromJson(json)).toList();
    } else {
      throw Exception('Erreur de chargement: ${response.statusCode}');
    }
  }

  Future<void> updateObjectProfile({
    required String id,
    required Map<String, dynamic> body,
    required String token,
  }) async {
    final url = Uri.parse(AppConfig.updateObjectProfileEndpoint(id));

    final response = await http.patch(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode != 200) {
      throw Exception("Erreur mise à jour : ${response.statusCode}");
    }
    
    final plantId = int.tryParse(id);
    if (plantId != null) {
      // Clear cache for this plant after update
      _plantCache.remove(plantId);
      
      // Notify all listeners that this plant was updated
      _plantUpdateController.add(plantId);
      print('📢 Notified all listeners that plant $plantId was updated');
    }
  }

  Future<ObjectProfile> fetchObjectProfileDetails(int plantId, String token) async {
    // Check cache first
    final cached = _plantCache[plantId];
    if (cached != null && !cached.isExpired(_cacheExpiration)) {
      print('🔄 Using cached data for plant $plantId');
      return cached.data;
    }

    print('📡 Fetching fresh data for plant $plantId');
    final url = Uri.parse("${AppConfig.baseUrl}/api/object-profile/$plantId");

    final response = await http.get(url, headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    });

    if (response.statusCode == 200) {
      final plant = ObjectProfile.fromJson(jsonDecode(response.body));
      
      // Cache the result
      _plantCache[plantId] = _CacheEntry(plant, DateTime.now());
      
      return plant;
    } else {
      throw Exception('Échec du chargement du profil de la plante');
    }
  }

  // Method to clear cache (useful for refresh)
  static void clearCache() {
    _plantCache.clear();
  }

  // Method to clear expired entries
  static void clearExpiredCache() {
    _plantCache.removeWhere((key, entry) => entry.isExpired(_cacheExpiration));
  }

  // Method to check cache without making API call
  ObjectProfile? getCachedPlant(int plantId) {
    final cached = _plantCache[plantId];
    if (cached != null && !cached.isExpired(_cacheExpiration)) {
      return cached.data;
    }
    return null;
  }

  // Method to force refresh all plant data
  static void notifyGlobalPlantDataChanged() {
    _plantUpdateController.add(-1); // -1 means "refresh all"
    print('📢 Notified all listeners to refresh all plant data');
  }

  /// Toggle favorite status for a plant
  /// If favoris is null, set it to 1 (add to favorites)
  /// If favoris is not null, set it to null (remove from favorites)
  Future<bool> toggleFavorite({
    required int plantId,
    required String token,
    int? currentFavorisValue,
  }) async {
    try {
      final newFavorisValue = currentFavorisValue == null ? 1 : null;
      
      await updateObjectProfile(
        id: plantId.toString(),
        body: {'favoris': newFavorisValue},
        token: token,
      );

      print('✅ Successfully toggled favorite for plant $plantId: ${newFavorisValue != null ? 'added' : 'removed'}');
      
      // Return the new favorite status
      return newFavorisValue != null;
    } catch (e) {
      print('❌ Error toggling favorite for plant $plantId: $e');
      throw Exception('Failed to toggle favorite: $e');
    }
  }
}
