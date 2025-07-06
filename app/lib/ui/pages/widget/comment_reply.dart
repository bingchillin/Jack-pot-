import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../../bloc/comment/comment_list_bloc.dart';
import '../../../models/comment_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/comment_service.dart';
import 'edit_comment_modal.dart';

class CommentReply extends StatelessWidget {
  final Comment comment;

  const CommentReply({
    Key? key,
    required this.comment,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête de la réponse
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: Colors.green.shade100,
                child: Text(
                  comment.person.firstname[0].toUpperCase(),
                  style: TextStyle(
                    color: Colors.green.shade700,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      comment.person.displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      _formatTimeAgo(comment.createdAt),
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              // Menu options pour les réponses
              if (comment.idPerson == _getCurrentUserId(context))
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_horiz, color: Colors.grey.shade600, size: 16),
                  onSelected: (value) {
                    if (value == 'delete') {
                      _showDeleteDialog(context);
                    } else if (value == 'edit') {
                      _showEditModal(context);
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit, color: Colors.blue, size: 16),
                          SizedBox(width: 8),
                          Text('Modifier', style: TextStyle(color: Colors.blue, fontSize: 12)),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, color: Colors.red, size: 16),
                          SizedBox(width: 8),
                          Text('Supprimer', style: TextStyle(color: Colors.red, fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 8),
          // Contenu de la réponse
          Text(
            comment.content,
            style: const TextStyle(fontSize: 14, height: 1.3),
          ),
          const SizedBox(height: 8),
          // Actions de la réponse
          Row(
            children: [
              // Bouton Like
              GestureDetector(
                onTap: () {
                  if (!_isUserAuthenticated(context)) {
                    _showAuthRequiredDialog(context, 'liker');
                    return;
                  }
                  _handleLike(context);
                },
                child: Row(
                  children: [
                    Icon(
                      comment.isLikedByCurrentUser ? Icons.favorite : Icons.favorite_border,
                      color: comment.isLikedByCurrentUser ? Colors.red : Colors.grey.shade600,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      comment.likeCount.toString(),
                      style: TextStyle(
                        color: comment.isLikedByCurrentUser ? Colors.red : Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              // Bouton Reply (pour répondre à une réponse)
              GestureDetector(
                onTap: () {
                  if (!_isUserAuthenticated(context)) {
                    _showAuthRequiredDialog(context, 'répondre');
                    return;
                  }
                  _showReplyToReplyModal(context);
                },
                child: Row(
                  children: [
                    Icon(
                      Icons.chat_bubble_outline,
                      color: Colors.grey.shade600,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      comment.replyCount.toString(),
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
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

  int _getCurrentUserId(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userIdStr = authProvider.userId;
    if (userIdStr != null) {
      return int.tryParse(userIdStr) ?? 0;
    }
    return 0;
  }

  bool _isUserAuthenticated(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return authProvider.isAuthenticated;
  }

  void _showDeleteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer la réponse'),
        content: const Text('Êtes-vous sûr de vouloir supprimer cette réponse ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              _handleDelete(context);
              Navigator.pop(context);
            },
            child: const Text('Supprimer', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showReplyToReplyModal(BuildContext context) {
    // TODO: Implémenter la modal pour répondre à une réponse
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Fonctionnalité de réponse à une réponse à venir !')),
    );
  }

  void _showEditModal(BuildContext context) {
    // TODO: Implémenter la modal pour éditer une réponse
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Fonctionnalité d\'édition d\'une réponse à venir !')),
    );
  }

  void _showAuthRequiredDialog(BuildContext context, String action) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Connexion requise'),
        content: Text('Connectez-vous pour $action cette réponse et participer à la communauté.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Plus tard'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Navigation vers la page de connexion
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Redirection vers la page de connexion...'),
                  backgroundColor: Colors.blue,
                ),
              );
            },
            child: const Text('Se connecter', style: TextStyle(color: Colors.blue)),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLike(BuildContext context) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.accessToken;
      if (token == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Token d\'authentification manquant'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final commentService = CommentService();
      await commentService.toggleLike(comment.idComment, token);
      
      // Rafraîchir la liste des commentaires
      context.read<CommentListBloc>().add(RefreshComments());
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors du like: \\${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _handleDelete(BuildContext context) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.accessToken;
      if (token == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Token d\'authentification manquant'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final commentService = CommentService();
      await commentService.deleteComment(comment.idComment, token);
      
      // Rafraîchir la liste des commentaires
      context.read<CommentListBloc>().add(RefreshComments());
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Réponse supprimée avec succès'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la suppression: \\${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
} 