import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../models/comment_model.dart';
import 'comment_reply.dart';
import 'create_reply_modal.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import 'edit_comment_modal.dart';
import '../../../bloc/comment/comment_item_bloc.dart';
import '../../../services/comment_service.dart';

class CommentCard extends StatefulWidget {
  final Comment comment;
  final List<Comment> replies;
  final bool showReplies;

  const CommentCard({
    Key? key,
    required this.comment,
    this.replies = const [],
    this.showReplies = false,
  }) : super(key: key);

  @override
  State<CommentCard> createState() => _CommentCardState();
}

class _CommentCardState extends State<CommentCard> {
  bool _showReplies = false;

  @override
  void initState() {
    super.initState();
    _showReplies = widget.showReplies;
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return BlocBuilder<CommentItemBloc, CommentItemState>(
      builder: (context, state) {
        Comment comment = widget.comment;
        if (state is CommentItemInitial) comment = state.comment;
        if (state is CommentItemLiked) comment = state.comment;
        if (state is CommentItemEdited) comment = state.comment;
        // Si supprimé, ne rien afficher
        if (state is CommentItemDeleted) return const SizedBox.shrink();
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 3,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête du commentaire
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: Colors.blue.shade100,
                      child: Text(
                        comment.person.firstname[0].toUpperCase(),
                        style: TextStyle(
                          color: Colors.blue.shade700,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Informations utilisateur
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            comment.person.displayName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            _formatTimeAgo(comment.createdAt),
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Menu options
                    PopupMenuButton<String>(
                      icon: Icon(Icons.more_horiz, color: Colors.grey.shade600),
                      onSelected: (value) {
                        if (value == 'delete') {
                          _showDeleteDialog();
                        } else if (value == 'edit') {
                          _showEditModal();
                        }
                      },
                      itemBuilder: (context) => [
                        if (comment.idPerson == _getCurrentUserId(context)) ...[
                          const PopupMenuItem(
                            value: 'edit',
                            child: Row(
                              children: [
                                Icon(Icons.edit, color: Colors.blue),
                                SizedBox(width: 8),
                                Text('Modifier', style: TextStyle(color: Colors.blue)),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(Icons.delete, color: Colors.red),
                                SizedBox(width: 8),
                                Text('Supprimer', style: TextStyle(color: Colors.red)),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              // Contenu du commentaire
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  comment.content,
                  style: const TextStyle(fontSize: 16, height: 1.4),
                ),
              ),
              const SizedBox(height: 16),
              // Actions (like, reply)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    // Bouton Like
                    GestureDetector(
                      onTap: () {
                        if (!_isUserAuthenticated(context)) {
                          _showAuthRequiredDialog(context, 'liker');
                          return;
                        }
                        context.read<CommentItemBloc>().add(LikeComment());
                      },
                      child: Row(
                        children: [
                          Icon(
                            comment.isLikedByCurrentUser ? Icons.favorite : Icons.favorite_border,
                            color: comment.isLikedByCurrentUser ? Colors.red : Colors.grey.shade600,
                            size: 20,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            comment.likeCount.toString(),
                            style: TextStyle(
                              color: comment.isLikedByCurrentUser ? Colors.red : Colors.grey.shade600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 24),
                    // Bouton Reply
                    GestureDetector(
                      onTap: () {
                        if (!_isUserAuthenticated(context)) {
                          _showAuthRequiredDialog(context, 'répondre');
                          return;
                        }
                        _showReplyModal(context);
                      },
                      child: Row(
                        children: [
                          Icon(
                            Icons.chat_bubble_outline,
                            color: Colors.grey.shade600,
                            size: 20,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            comment.replyCount.toString(),
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    // Bouton pour afficher/masquer les réponses
                    if (comment.replyCount > 0)
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _showReplies = !_showReplies;
                          });
                          // TODO: Charger les replies via un bloc dédié si besoin
                        },
                        child: Text(
                          _showReplies ? 'Masquer les réponses' : 'Voir les réponses',
                          style: TextStyle(
                            color: Colors.blue.shade600,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              // Réponses
              if (_showReplies && widget.replies.isNotEmpty)
                Container(
                  margin: const EdgeInsets.only(left: 16),
                  child: Column(
                    children: widget.replies.map((reply) => CommentReply(comment: reply)).toList(),
                  ),
                ),
            ],
          ),
        );
      },
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

  void _showDeleteDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Supprimer le commentaire'),
        content: const Text('Êtes-vous sûr de vouloir supprimer ce commentaire ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              context.read<CommentItemBloc>().add(DeleteComment());
              Navigator.pop(dialogContext);
            },
            child: const Text('Supprimer', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showReplyModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreateReplyModal(parentComment: widget.comment),
    );
  }

  void _showEditModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) => EditCommentModal(comment: widget.comment),
    );
  }

  bool _isUserAuthenticated(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return authProvider.isAuthenticated;
  }

  void _showAuthRequiredDialog(BuildContext context, String action) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Connexion requise'),
        content: Text('Connectez-vous pour $action ce commentaire et participer à la communauté.'),
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
} 