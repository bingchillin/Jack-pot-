import 'dart:convert';
import 'package:http/http.dart' as http;
import '../app_config.dart';
import '../models/plant_type.dart';

class PlantTypeService {
  final String baseUrl = AppConfig.baseUrl;

  /// Récupère tous les types de plantes pour l'encyclopédie
  Future<List<PlantType>> getAllPlantTypes() async {
    try {
      final uri = Uri.parse('$baseUrl/api/plant-types');
      
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
    } catch (e) {
      throw Exception('Erreur de connexion: $e');
    }
  }

  /// Récupère un type de plante spécifique par ID
  Future<PlantType> getPlantTypeById(int id) async {
    try {
      final uri = Uri.parse('$baseUrl/api/plant-type/$id');
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return PlantType.fromJson(data);
      } else {
        throw Exception('Erreur de chargement du type de plante: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur de connexion: $e');
    }
  }

  /// Recherche des types de plantes par titre
  Future<List<PlantType>> searchPlantTypes(String title) async {
    try {
      final uri = Uri.parse('$baseUrl/plant-type/search?title=$title');
      
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
        throw Exception('Erreur de recherche: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur de connexion: $e');
    }
  }
} 