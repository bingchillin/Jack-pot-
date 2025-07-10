import 'dart:convert';
import 'package:http/http.dart' as http;

class CommentFlagService {
  static const String baseUrl = 'http://10.0.2.2:3000';

  // Signaler un commentaire
  Future<Map<String, dynamic>> flagComment({
    required int commentId,
    required int idPerson,
    required String reason,
    String? details,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/comments/$commentId/flag');
    final body = {
      'idPerson': idPerson,
      'reason': reason,
      if (details != null && details.isNotEmpty) 'details': details,
    };

    print('Flutter - Flagging comment $commentId with reason: $reason');

    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    print('Flutter - Flag response status: ${response.statusCode}');
    print('Flutter - Flag response body: ${response.body}');

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 400) {
      final errorData = jsonDecode(response.body);
      throw Exception('Erreur: ${errorData['message'] ?? 'Vous avez déjà signalé ce commentaire'}');
    } else {
      throw Exception('Erreur de signalement: ${response.statusCode} - ${response.body}');
    }
  }

  // Vérifier si un utilisateur a signalé un commentaire
  Future<bool> isFlaggedByUser({
    required int commentId,
    required int userId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/comments/$commentId/flags/me/$userId');
    
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['flagged'] ?? false;
    } else {
      return false; // En cas d'erreur, considérer comme non signalé
    }
  }

  // Obtenir le nombre de signalements d'un commentaire
  Future<int> getFlagCount({
    required int commentId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/comments/$commentId/flags/count');
    
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['flagCount'] ?? 0;
    } else {
      return 0;
    }
  }

  // Obtenir tous les commentaires signalés (admin seulement)
  Future<List<Map<String, dynamic>>> getFlaggedComments({
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/comments/moderation/flagged');
    
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Erreur de récupération des commentaires signalés: ${response.statusCode}');
    }
  }

  // Supprimer un signalement (admin ou utilisateur qui a signalé)
  Future<void> removeFlag({
    required int flagId,
    int? userId,
    required String token,
  }) async {
    final url = userId != null 
        ? Uri.parse('$baseUrl/comments/flags/$flagId?userId=$userId')
        : Uri.parse('$baseUrl/comments/flags/$flagId');
    
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 204) {
      throw Exception('Erreur de suppression du signalement: ${response.statusCode}');
    }
  }
} 