import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/comment_model.dart';
import '../models/contact_model.dart';
import '../app_config.dart';
import '../models/user_profile_model.dart';
import 'contact_service.dart';

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
    String? imageUrl,
    String? tag,
    int? parentCommentId,
    required String token,
    String? userId,
  }) async {
    final url = Uri.parse('$baseUrl/comments');
    final body = {
      'content': content,
      if (imageUrl != null) 'imageUrl': imageUrl,
      if (tag != null) 'tag': tag,
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

  // Récupérer le profil d'un utilisateur
  Future<UserProfile> fetchUserProfile(int userId, String? token) async {
    final url = Uri.parse('${AppConfig.baseUrl}/person/$userId');
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      return UserProfile.fromJson(json.decode(response.body));
    } else {
      throw Exception('Erreur de chargement du profil utilisateur: \\${response.statusCode}');
    }
  }

  // Récupérer les posts principaux d'un utilisateur
  Future<List<Comment>> fetchUserMainComments(int userId, String? token, {String? currentUserId}) async {
    final url = Uri.parse(currentUserId != null && currentUserId.isNotEmpty
      ? '${AppConfig.baseUrl}/person/$userId/parent-comments?userId=$currentUserId'
      : '${AppConfig.baseUrl}/person/$userId/parent-comments');
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
      throw Exception('Erreur de chargement des posts utilisateur: \\${response.statusCode}');
    }
  }

  // Récupérer uniquement les commentaires des amis (avec filtrage des bloqués)
  Future<List<Comment>> fetchFriendsComments(String token, int userId) async {
    try {
      print('Flutter - Loading friends comments for user $userId');
      
      // D'abord, récupérer tous les commentaires avec filtrage des bloqués
      final allComments = await fetchMainCommentsWithoutBlocked(token, userId: userId.toString());
      
      // Ensuite, récupérer la liste des amis
      final contactService = ContactService();
      final friends = await contactService.getMyContacts(token: token);
      
      // Extraire les IDs des amis (contacts acceptés)
      final friendIds = friends
          .where((contact) => contact.isAccepted)
          .map((contact) => contact.getOtherUser(userId)?.id)
          .where((id) => id != null)
          .cast<int>()
          .toSet();
      
      // Filtrer les commentaires pour ne garder que ceux des amis
      final friendsComments = allComments
          .where((comment) => friendIds.contains(comment.idPerson))
          .toList();
      
      print('Flutter - Found ${friendsComments.length} comments from ${friendIds.length} friends');
      
      return friendsComments;
    } catch (e) {
      print('Error loading friends comments: $e');
      throw Exception('Error loading friends comments: $e');
    }
  }

  // Filtrer les commentaires en excluant les utilisateurs bloqués
  Future<List<Comment>> _filterBlockedUsers(List<Comment> comments, String token, int currentUserId) async {
    try {
      print('🔍 Flutter - Filtering blocked users for user $currentUserId');
      
      // Toujours récupérer les contacts frais (pas de cache)
      print('🔄 Flutter - Fetching fresh contacts data');
      final contactService = ContactService();
      
      // Récupérer TOUS les types de contacts (acceptés, en attente, envoyés, bloqués)
      final myContacts = await contactService.getMyContacts(token: token);
      final pendingRequests = await contactService.getPendingRequests(token: token);
      final sentRequests = await contactService.getSentRequests(token: token);
      final blockedContacts = await contactService.getBlockedContacts(token: token);
      
      // Combiner tous les contacts
      final allContacts = [...myContacts, ...pendingRequests, ...sentRequests, ...blockedContacts];
      
              print('📞 Flutter - Found ${allContacts.length} total contacts');
      
      // Debug détaillé de tous les contacts
      for (var contact in allContacts) {
        print('📱 Contact ${contact.id}: status=${contact.status.value}, requester=${contact.requesterId}, receiver=${contact.receiverId}, blockedBy=${contact.blockedBy}');
      }
      
      // Obtenir les IDs des utilisateurs bloqués
      final filteredBlockedContacts = allContacts.where((contact) {
        try {
          return contact.isBlocked;
        } catch (e) {
          print('Error checking if contact is blocked: $e');
          return false;
        }
      }).toList();
      print('🚫 Flutter - Blocked contacts: ${filteredBlockedContacts.length}');
      
      for (var contact in filteredBlockedContacts) {
        try {
          final otherUser = contact.getOtherUser(currentUserId);
          print('👤 Blocked user: ${otherUser?.id} (${otherUser?.displayName})');
        } catch (e) {
          print('Error getting other user: $e');
        }
      }
      
      final blockedUserIds = <int>{};
      for (var contact in filteredBlockedContacts) {
        try {
          final otherUser = contact.getOtherUser(currentUserId);
          if (otherUser?.id != null) {
            blockedUserIds.add(otherUser!.id);
          }
        } catch (e) {
          print('Error getting blocked user ID: $e');
        }
      }
      
      print('🎯 Flutter - Final blocked user IDs: $blockedUserIds');
      
      // Debug des commentaires à filtrer
      print('💬 Comments to filter: ${comments.map((c) => 'Comment from user ${c.idPerson}')}');
      
      // Filtrer les commentaires pour exclure ceux des utilisateurs bloqués
      final filteredComments = comments
          .where((comment) => !blockedUserIds.contains(comment.idPerson))
          .toList();
          
      print('✅ Flutter - Filtered ${comments.length - filteredComments.length} comments from blocked users');
      print('📝 Remaining comments: ${filteredComments.map((c) => 'Comment from user ${c.idPerson}')}');
      
      return filteredComments;
    } catch (e) {
      print('❌ Error filtering blocked users: $e');
      // En cas d'erreur, retourner la liste originale
      return comments;
    }
  }



  // Récupérer tous les commentaires principaux avec filtrage des utilisateurs bloqués
  Future<List<Comment>> fetchMainCommentsWithoutBlocked(String? token, {String? userId}) async {
    if (token == null || userId == null) {
      // Si pas connecté, utiliser la méthode normale
      return fetchMainComments(token, userId: userId);
    }

    try {
      // Récupérer tous les commentaires
      final allComments = await fetchMainComments(token, userId: userId);
      
      // Filtrer les utilisateurs bloqués (toujours avec des données fraîches)
      final filteredComments = await _filterBlockedUsers(
        allComments, 
        token, 
        int.parse(userId)
      );
      
      print('Filtered ${allComments.length - filteredComments.length} comments from blocked users');
      
      return filteredComments;
    } catch (e) {
      print('Error loading comments without blocked users: $e');
      // En cas d'erreur, retourner la méthode normale
      return fetchMainComments(token, userId: userId);
    }
  }
} 