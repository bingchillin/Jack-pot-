import 'dart:convert';
import 'package:app/app_config.dart';
import 'package:http/http.dart' as http;
import '../models/object_profile.dart';

class PlantProvider {
  final String baseUrl;
  final String token;

  PlantProvider({required this.baseUrl, required this.token});

  Future<List<ObjectProfile>> fetchProfiles(int personId) async {
    final url = Uri.parse(AppConfig.objectProfilesFavorisEndpoint(personId.toString()));
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
