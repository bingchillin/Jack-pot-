import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import '../models/comment_mention_model.dart';
import '../app_config.dart';

class MentionService {
  static String get baseUrl => AppConfig.baseUrl;

  /// Rechercher des utilisateurs pour l'autocomplétion des mentions
  Future<List<MentionUser>> searchUsersForMention({
    required String query,
    required String token,
    int limit = 10,
  }) async {
    if (query.length < 2) {
      return [];
    }

    final url = Uri.parse('$baseUrl/comments/users/search');
    final queryParams = {
      'q': query,
      'limit': limit.toString(),
    };
    final finalUrl = url.replace(queryParameters: queryParams);

    print('Flutter - Searching users for mention: $query');

    try {
      final response = await http.get(
        finalUrl,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      print('Flutter - Search users response status: ${response.statusCode}');
      print('Flutter - Search users response body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => MentionUser.fromJson(json)).toList();
      } else {
        throw Exception('Erreur de recherche d\'utilisateurs: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Flutter - Error searching users for mention: $e');
      throw Exception('Erreur de connexion lors de la recherche d\'utilisateurs: $e');
    }
  }

  /// Récupérer les mentions d'un commentaire
  Future<List<CommentMention>> getCommentMentions({
    required int commentId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/comments/$commentId/mentions');

    print('Flutter - Getting mentions for comment: $commentId');

    try {
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      print('Flutter - Get mentions response status: ${response.statusCode}');
      print('Flutter - Get mentions response body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => CommentMention.fromJson(json)).toList();
      } else {
        throw Exception('Erreur de récupération des mentions: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Flutter - Error getting comment mentions: $e');
      throw Exception('Erreur de connexion lors de la récupération des mentions: $e');
    }
  }

  /// Extraire les mentions d'un texte (côté client)
  List<MentionData> extractMentionsFromText(String text) {
    final mentionRegex = RegExp(r'@([a-zA-Z0-9_]+)');
    final mentions = <MentionData>[];
    
    for (final match in mentionRegex.allMatches(text)) {
      mentions.add(MentionData(
        username: match.group(1)!,
        positionStart: match.start,
        positionEnd: match.end,
      ));
    }
    
    return mentions;
  }

  /// Formater le texte avec les mentions pour l'affichage
  List<TextSpan> formatTextWithMentions({
    required String text,
    required List<CommentMention> mentions,
    required TextStyle normalStyle,
    required TextStyle mentionStyle,
    Function(int userId)? onMentionTap,
  }) {
    if (mentions.isEmpty) {
      return [TextSpan(text: text, style: normalStyle)];
    }

    final spans = <TextSpan>[];
    int currentIndex = 0;

    // Trier les mentions par position
    final sortedMentions = List<CommentMention>.from(mentions)
      ..sort((a, b) => a.positionStart.compareTo(b.positionStart));

    for (final mention in sortedMentions) {
      // Ajouter le texte avant la mention
      if (currentIndex < mention.positionStart) {
        spans.add(TextSpan(
          text: text.substring(currentIndex, mention.positionStart),
          style: normalStyle,
        ));
      }

      // Ajouter la mention
      final mentionText = text.substring(mention.positionStart, mention.positionEnd);
      spans.add(TextSpan(
        text: mentionText,
        style: mentionStyle,
        recognizer: onMentionTap != null 
          ? (TapGestureRecognizer()..onTap = () => onMentionTap(mention.idPersonMentioned))
          : null,
      ));

      currentIndex = mention.positionEnd;
    }

    // Ajouter le texte restant
    if (currentIndex < text.length) {
      spans.add(TextSpan(
        text: text.substring(currentIndex),
        style: normalStyle,
      ));
    }

    return spans;
  }

  /// Remplacer un mention placeholder par le vrai username
  String replaceMentionInText({
    required String text,
    required String placeholder,
    required String username,
  }) {
    return text.replaceAll(placeholder, '@$username');
  }

  /// Valider si un texte contient des mentions valides
  bool hasValidMentions(String text) {
    final mentions = extractMentionsFromText(text);
    return mentions.isNotEmpty;
  }
}

// Classe pour les données de mention extraites du texte
class MentionData {
  final String username;
  final int positionStart;
  final int positionEnd;

  MentionData({
    required this.username,
    required this.positionStart,
    required this.positionEnd,
  });
}

