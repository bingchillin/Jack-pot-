import 'dart:convert';
import 'package:http/http.dart' as http;

import '../app_config.dart';
import '../models/plant_type.dart';

class PlantService {
  final String baseUrl =  AppConfig.baseUrl;

  Future<List<PlantType>> fetchPlantTypeBySearch(String title) async {
    final uri = Uri.parse(AppConfig.plantTypeSearch(title));

    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => PlantType.fromJson(json)).toList();
    } else {
      throw Exception('Erreur de chargement des types de plantes: ${response.statusCode}');
    }
  }
}
