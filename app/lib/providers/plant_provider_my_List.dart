import 'dart:convert';
import 'package:http/http.dart' as http;
import '../app_config.dart';
import '../models/object_profile.dart';

class PlantProviderMyList {
  final String baseUrl;
  final String token;

  PlantProviderMyList({required this.baseUrl, required this.token});

  Future<List<ObjectProfile>> fetchProfilesMyList(int personId) async {
    final url = Uri.parse(AppConfig.objectProfilesEndpoint(personId.toString()));
    final resp = await http.get(url, headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    });
    if (resp.statusCode == 200) {
      final List<dynamic> data = json.decode(resp.body);
      return data.map((e) => ObjectProfile.fromJson(e)).toList();
    } else {
      throw Exception('Fetch failed: ${resp.statusCode}');
    }
  }
}
