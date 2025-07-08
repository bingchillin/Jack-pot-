import 'package:flutter/material.dart';
import '../../models/comment_model.dart';

class ThreadView extends StatelessWidget {
  final List<Comment> threadHierarchy;
  final Function(Comment)? onLike;
  final Function(Comment)? onReply;

  const ThreadView({
    super.key,
    required this.threadHierarchy,
    this.onLike,
    this.onReply,
  });

  @override
  Widget build(BuildContext context) {
    if (threadHierarchy.isEmpty) {
      return const Center(
        child: Text('Aucun commentaire à afficher'),
      );
    }

    return Column(
      children: threadHierarchy.map((comment) => _buildCommentThread(comment)).toList(),
    );
  }

  Widget _buildCommentThread(Comment comment) {
    return Column(
      children: [
        _buildComment(comment),
        if (comment.hasChildren)
          ...comment.children.map((child) => _buildCommentThread(child)),
      ],
    );
  }

  Widget _buildComment(Comment comment) {
    return Container(
      margin: EdgeInsets.only(
        left: comment.level * 20.0, // Indentation par niveau
        bottom: 12,
        top: comment.level > 0 ? 8 : 16,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ligne de connexion pour les réponses
          if (comment.level > 0) _buildConnectionLine(comment.level),
          
          // Carte du commentaire
          Expanded(
            child: Card(
              elevation: comment.level == 0 ? 2 : 1,
              color: _getCommentColor(comment.level),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header du commentaire
                    _buildCommentHeader(comment),
                    const SizedBox(height: 12),
                    
                    // Contenu
                    Text(
                      comment.content,
                      style: const TextStyle(
                        fontSize: 16,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Actions
                    _buildCommentActions(comment),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnectionLine(int level) {
    return Container(
      width: 3,
      height: 60,
      margin: const EdgeInsets.only(right: 12, top: 16),
      decoration: BoxDecoration(
        color: _getConnectionColor(level),
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  Widget _buildCommentHeader(Comment comment) {
    return Row(
      children: [
        // Avatar
        CircleAvatar(
          radius: 18,
          backgroundColor: _getAvatarColor(comment.level),
          child: Text(
            comment.person.displayName.isNotEmpty 
              ? comment.person.displayName[0].toUpperCase()
              : 'U',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 12),
        
        // Nom et informations
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    comment.person.displayName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  if (comment.level > 0) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getLevelBadgeColor(comment.level),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Niveau ${comment.level}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 2),
              Text(
                _formatTimeAgo(comment.createdAt),
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCommentActions(Comment comment) {
    return Row(
      children: [
        // Bouton Like
        InkWell(
          onTap: () => onLike?.call(comment),
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  comment.isLikedByCurrentUser ? Icons.favorite : Icons.favorite_border,
                  size: 20,
                  color: comment.isLikedByCurrentUser ? Colors.red : Colors.grey[600],
                ),
                const SizedBox(width: 4),
                Text(
                  comment.likeCount.toString(),
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        
        // Bouton Reply (seulement si possible)
        if (comment.canReply)
          InkWell(
            onTap: () => onReply?.call(comment),
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.reply,
                    size: 20,
                    color: Colors.blue[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Répondre',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.blue[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        
        // Indicateur de niveau max
        if (!comment.canReply)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.orange[100],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'Niveau maximum',
              style: TextStyle(
                fontSize: 12,
                color: Colors.orange[800],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }

  // Couleurs par niveau
  Color _getCommentColor(int level) {
    switch (level) {
      case 0: return Colors.white;
      case 1: return Colors.blue[50]!;
      case 2: return Colors.green[50]!;
      case 3: return Colors.orange[50]!;
      default: return Colors.grey[50]!;
    }
  }

  Color _getConnectionColor(int level) {
    switch (level) {
      case 1: return Colors.blue[400]!;
      case 2: return Colors.green[400]!;
      case 3: return Colors.orange[400]!;
      default: return Colors.grey[400]!;
    }
  }

  Color _getAvatarColor(int level) {
    switch (level) {
      case 0: return Colors.blue[600]!;
      case 1: return Colors.blue[500]!;
      case 2: return Colors.green[500]!;
      case 3: return Colors.orange[500]!;
      default: return Colors.grey[500]!;
    }
  }

  Color _getLevelBadgeColor(int level) {
    switch (level) {
      case 1: return Colors.blue[600]!;
      case 2: return Colors.green[600]!;
      case 3: return Colors.orange[600]!;
      default: return Colors.grey[600]!;
    }
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return 'Il y a ${difference.inDays}j';
    } else if (difference.inHours > 0) {
      return 'Il y a ${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return 'Il y a ${difference.inMinutes}min';
    } else {
      return 'À l\'instant';
    }
  }
} 