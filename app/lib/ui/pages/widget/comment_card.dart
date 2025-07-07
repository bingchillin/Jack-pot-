import 'package:flutter/material.dart';
import '../../../models/comment_model.dart';
import '../comment_detail_page.dart';
import 'create_reply_modal.dart';
import '../../../services/comment_service.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../bloc/comment/comment_list_bloc.dart';

class CommentCard extends StatefulWidget {
  final Comment comment;
  final List<Comment> replies;
  final bool showReplies;

  const CommentCard({
    super.key,
    required this.comment,
    this.replies = const [],
    this.showReplies = false,
  });

  @override
  State<CommentCard> createState() => _CommentCardState();
}

class _CommentCardState extends State<CommentCard> {
  late Comment _comment;

  @override
  void initState() {
    super.initState();
    _comment = widget.comment;
  }

  Future<void> _handleLike() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final userId = authProvider.userId;
    if (token == null || userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connectez-vous pour liker')),
      );
      return;
    }
    try {
      final result = await CommentService().toggleLike(_comment.idComment, token, userId);
      setState(() {
        _comment = _comment.copyWith(
          likeCount: result['likeCount'] ?? _comment.likeCount,
          isLikedByCurrentUser: result['liked'] ?? _comment.isLikedByCurrentUser,
        );
      });
      if (mounted) {
        context.read<CommentListBloc>().add(RefreshComments());
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur lors du like: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = Provider.of<AuthProvider>(context, listen: false).isAuthenticated;
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => CommentDetailPage(commentId: _comment.idComment),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withValues(alpha: 0.1),
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
                      _comment.person.firstname.isNotEmpty 
                          ? _comment.person.firstname[0].toUpperCase()
                          : 'U',
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
                          _comment.person.displayName,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          _formatTimeAgo(_comment.createdAt),
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Contenu du commentaire
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                _comment.content,
                style: const TextStyle(fontSize: 16, height: 1.4),
              ),
            ),
            const SizedBox(height: 16),
            // Ligne d'actions (icône répondre)
            Padding(
              padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.chat_bubble_outline, color: Colors.blue),
                        tooltip: 'Répondre',
                        color: isAuthenticated ? Colors.blue : Colors.grey.shade400,
                        onPressed: isAuthenticated
                            ? () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  shape: const RoundedRectangleBorder(
                                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                                  ),
                                  builder: (context) => CreateReplyModal(parentComment: _comment),
                                );
                              }
                            : () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text('Connectez-vous pour répondre'),
                                    action: SnackBarAction(
                                      label: 'Se connecter',
                                      onPressed: () {
                                        Navigator.pushNamed(context, '/login');
                                      },
                                    ),
                                  ),
                                );
                              },
                      ),
                      if (_comment.replyCount > 0)
                        Positioned(
                          right: 4,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.blue,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${_comment.replyCount}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          _comment.isLikedByCurrentUser ? Icons.favorite : Icons.favorite_border,
                          color: _comment.isLikedByCurrentUser ? Colors.red : Colors.grey.shade600,
                          size: 22,
                        ),
                        tooltip: _comment.isLikedByCurrentUser ? 'Retirer le like' : 'Liker',
                        onPressed: _handleLike,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        '${_comment.likeCount}',
                        style: TextStyle(
                          color: Colors.grey.shade700,
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
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
} 