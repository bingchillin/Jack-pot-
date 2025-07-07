import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/comment_model.dart';
import '../app_config.dart';

class CommentService {
  final String baseUrl = AppConfig.baseUrl;

  // Récupérer tous les commentaires principaux (timeline)
  Future<List<Comment>> fetchMainComments(String? token, {String? userId}) async {
    final url = Uri.parse(userId != null && userId.isNotEmpty
      ? '$baseUrl/comments/timeline?userId=$userId'
      : '$baseUrl/comments/timeline');
    
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token seulement s'il est valide
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    // Log de l'URL complet utilisé
    print('==== URL endpoint utilisé ====');
    print(url.toString());
    
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      // Log du JSON brut reçu
      print('==== JSON BRUT /comments/timeline ====');
      print(response.body);
      try {
        return data.map((json) => Comment.fromJson(json)).toList();
      } catch (e, stack) {
        print('Erreur lors du mapping d\'un commentaire : $e');
        print('Stacktrace : $stack');
        print('JSON fautif :');
        print(data);
        rethrow;
      }
    } else {
      throw Exception('Erreur de chargement des commentaires: ${response.statusCode}');
    }
  }

  // Récupérer un seul commentaire parent
  Future<Comment> fetchParentComment(int commentId, String? token) async {
    final url = Uri.parse('$baseUrl/comments/parent/$commentId');
    
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token seulement s'il est valide
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      return Comment.fromJson(json.decode(response.body));
    } else if (response.statusCode == 404) {
      throw Exception('Commentaire parent non trouvé');
    } else {
      throw Exception('Erreur de chargement du commentaire: ${response.statusCode}');
    }
  }

  // Récupérer les réponses d'un commentaire
  Future<List<Comment>> fetchReplies(int commentId, String? token) async {
    final url = Uri.parse('$baseUrl/comments/getCommentsByParentId/$commentId');
    
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
    String? userId,
  }) async {
    final url = Uri.parse('$baseUrl/comments');
    final body = {
      'content': content,
      if (parentCommentId != null) 'parentCommentId': parentCommentId,
      if (userId != null) 'idPerson': int.tryParse(userId),
    };

    print('Flutter - Creating comment with body: $body');
    print('Flutter - URL: $url');
    print('Flutter - Token: ${token.substring(0, 20)}...');

    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    print('Flutter - Response status: ${response.statusCode}');
    print('Flutter - Response body: ${response.body}');

    if (response.statusCode == 201) {
      return Comment.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur de création du commentaire: ${response.statusCode} - ${response.body}');
    }
  }

  // Liker/Unliker un commentaire
  Future<Map<String, dynamic>> toggleLike(int commentId, String token, String userId) async {
    final url = Uri.parse('$baseUrl/comments/$commentId/like');
    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'idPerson': int.parse(userId)}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return {
        'liked': data['liked'],
        'likeCount': data['likeCount'],
      };
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

  // Récupérer un commentaire par son id (parent ou réponse)
  Future<Comment> fetchCommentById(int commentId, String? token) async {
    final url = Uri.parse('$baseUrl/comments/$commentId');
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      return Comment.fromJson(json.decode(response.body));
    } else if (response.statusCode == 404) {
      throw Exception('Commentaire non trouvé');
    } else {
      throw Exception('Erreur de chargement du commentaire: ${response.statusCode}');
    }
  }

  // Récupérer un post (commentaire parent) + toutes ses réponses (détail)
  Future<List<Comment>> fetchPostWithComments(int postId, String? token, {String? userId}) async {
    final url = Uri.parse(userId != null && userId.isNotEmpty
      ? '$baseUrl/comments/$postId/withComments?userId=$userId'
      : '$baseUrl/comments/$postId/withComments');
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((json) => Comment.fromJson(json)).toList();
    } else {
      throw Exception('Erreur de chargement du post: \\${response.statusCode}');
    }
  }
} 