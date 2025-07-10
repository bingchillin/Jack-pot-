import 'package:flutter/material.dart';
import '../../models/comment_mention_model.dart';
import 'package:flutter/gestures.dart';

class UserMentionSuggestions extends StatelessWidget {
  final List<MentionUser> users;
  final Function(MentionUser) onUserSelected;
  final bool isLoading;
  final String query;

  const UserMentionSuggestions({
    Key? key,
    required this.users,
    required this.onUserSelected,
    this.isLoading = false,
    required this.query,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Container(
        height: 120,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (users.isEmpty && query.length >= 2) {
      return Container(
        height: 60,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Text(
            'Aucun utilisateur trouvé',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 14,
            ),
          ),
        ),
      );
    }

    if (users.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      constraints: const BoxConstraints(
        maxHeight: 250,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListView.builder(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(vertical: 4),
        itemCount: users.length,
        itemBuilder: (context, index) {
          final user = users[index];
          return _buildUserTile(user);
        },
      ),
    );
  }

  Widget _buildUserTile(MentionUser user) {
    return InkWell(
      onTap: () => onUserSelected(user),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 20,
              backgroundColor: Colors.blue.shade100,
              child: Text(
                _getInitials(user),
                style: TextStyle(
                  color: Colors.blue.shade700,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 12),
            
            // Informations utilisateur
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Nom complet
                  Text(
                    user.displayName,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 2),
                  
                  // Username pour mention
                  Text(
                    '@${user.mentionText}',
                    style: TextStyle(
                      color: Colors.blue.shade600,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  
                  // Email complet
                  Text(
                    user.email,
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            
            // Icône de sélection
            Icon(
              Icons.person_add_outlined,
              color: Colors.grey.shade400,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  String _getInitials(MentionUser user) {
    final firstname = user.firstname.trim();
    final surname = user.surname.trim();
    
    if (firstname.isNotEmpty && surname.isNotEmpty) {
      return '${firstname[0].toUpperCase()}${surname[0].toUpperCase()}';
    } else if (firstname.isNotEmpty) {
      return firstname[0].toUpperCase();
    } else if (surname.isNotEmpty) {
      return surname[0].toUpperCase();
    } else {
      return 'U';
    }
  }
}

// Widget pour afficher les mentions dans le texte
class MentionRichText extends StatelessWidget {
  final String text;
  final List<CommentMention> mentions;
  final TextStyle? textStyle;
  final Function(int userId)? onMentionTap;

  const MentionRichText({
    Key? key,
    required this.text,
    this.mentions = const [],
    this.textStyle,
    this.onMentionTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final normalStyle = textStyle ?? const TextStyle(fontSize: 16);
    final mentionStyle = normalStyle.copyWith(
      color: Colors.blue.shade600,
      fontWeight: FontWeight.w600,
    );

    if (mentions.isEmpty) {
      return Text(text, style: normalStyle);
    }

    // Utiliser le service pour formater le texte
    final spans = _formatTextWithMentions(
      text: text,
      mentions: mentions,
      normalStyle: normalStyle,
      mentionStyle: mentionStyle,
      onMentionTap: onMentionTap,
    );

    return RichText(
      text: TextSpan(children: spans),
    );
  }

  List<TextSpan> _formatTextWithMentions({
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
}