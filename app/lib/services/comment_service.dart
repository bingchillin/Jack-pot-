import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/comment_model.dart';
import '../app_config.dart';

class CommentService {
  final String baseUrl = AppConfig.baseUrl;

  // Récupérer tous les commentaires principaux
  Future<List<Comment>> fetchMainComments(String? token) async {
    final url = Uri.parse('$baseUrl/comments');
    
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token seulement s'il est valide
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((json) => Comment.fromJson(json)).toList();
    } else {
      throw Exception('Erreur de chargement des commentaires: ${response.statusCode}');
    }
  }

  // Récupérer les réponses d'un commentaire
  Future<List<Comment>> fetchReplies(int commentId, String? token) async {
    final url = Uri.parse('$baseUrl/comments/replies/$commentId');
    
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token seulement s'il est valide
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((json) => Comment.fromJson(json)).toList();
    } else {
      throw Exception('Erreur de chargement des réponses: ${response.statusCode}');
    }
  }

  // Créer un nouveau commentaire
  Future<Comment> createComment({
    required String content,
    int? parentCommentId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/comments');
    final body = {
      'content': content,
      if (parentCommentId != null) 'parentCommentId': parentCommentId,
    };

    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 201) {
      return Comment.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur de création du commentaire: ${response.statusCode}');
    }
  }

  // Liker/Unliker un commentaire
  Future<bool> toggleLike(int commentId, String token) async {
    final url = Uri.parse('$baseUrl/comments/$commentId/like');
    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['liked'];
    } else {
      throw Exception('Erreur de like/unlike: ${response.statusCode}');
    }
  }

  // Supprimer un commentaire
  Future<void> deleteComment(int commentId, String token) async {
    final url = Uri.parse('$baseUrl/comments/$commentId');
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Erreur de suppression: ${response.statusCode}');
    }
  }

  // Modifier un commentaire
  Future<Comment> updateComment({
    required int commentId,
    required String content,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/comments/$commentId');
    final body = {'content': content};

    final response = await http.patch(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      return Comment.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur de modification: ${response.statusCode}');
    }
  }
} 