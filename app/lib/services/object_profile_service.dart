import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/object_profile.dart';


class ObjectProfileService {
  final String baseUrl = 'http://localhost:3000';

  Future<List<ObjectProfile>> fetchProfiles(String personId, String token) async {
    final url = Uri.parse('$baseUrl/person/$personId/object-profiles');
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
}
