import 'dart:convert';
import 'package:http/http.dart' as http;
import '../app_config.dart';
import '../models/leaderboard_entry.dart';

class LeaderboardService {
  final String baseUrl = AppConfig.baseUrl;

  // Get leaderboard with pagination
  Future<LeaderboardResponse> getLeaderboard({
    int page = 1,
    int limit = 20,
    String? token,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/leaderboard?page=$page&limit=$limit');
      
      final headers = <String, String>{
        'Content-Type': 'application/json',
      };
      
      // Add authorization header only if token is provided
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
      
      final response = await http.get(
        uri,
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return LeaderboardResponse.fromJson(data);
      } else {
        throw Exception('Failed to load leaderboard: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error loading leaderboard: $e');
    }
  }

  // Get current user's rank
  Future<int?> getMyRank(String token) async {
    try {
      print('🔄 getMyRank: Making API call...');
      final uri = Uri.parse('$baseUrl/leaderboard/my-rank');
      print('🔄 getMyRank: URI: $uri');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('🏆 getMyRank: Response status: ${response.statusCode}');
      print('🏆 getMyRank: Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🏆 getMyRank: Parsed data: $data');
        return data['rank'];
      } else {
        print('❌ getMyRank: Error status code: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ getMyRank: Exception: $e');
      return null;
    }
  }

  // Get current user's stats
  Future<LeaderboardEntry?> getMyStats(String token) async {
    try {
      print('🔄 getMyStats: Making API call...');
      final uri = Uri.parse('$baseUrl/leaderboard/my-stats');
      print('🔄 getMyStats: URI: $uri');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('📊 getMyStats: Response status: ${response.statusCode}');
      print('📊 getMyStats: Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('📊 getMyStats: Parsed data: $data');
        return data != null ? LeaderboardEntry.fromJson(data) : null;
      } else {
        print('❌ getMyStats: Error status code: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ getMyStats: Exception: $e');
      return null;
    }
  }
} 