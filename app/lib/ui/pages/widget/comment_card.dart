import 'package:flutter/material.dart';
import '../../../models/comment_model.dart';
import '../comment_detail_page.dart';
import 'create_reply_modal.dart';
import '../../../services/comment_service.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../bloc/comment/comment_list_bloc.dart';
import '../user_profile_page.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/comment/comment_item_bloc.dart';
import '../../../bloc/comment/comment_detail_bloc.dart';

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

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = Provider.of<AuthProvider>(context, listen: false).isAuthenticated;
    return BlocBuilder<CommentItemBloc, CommentItemState>(
      builder: (context, state) {
        Comment displayComment;
        if (state is CommentItemInitial || state is CommentItemLiked || state is CommentItemEdited) {
          displayComment = (state as dynamic).comment;
        } else if (state is CommentItemLiking) {
          displayComment = _comment;
        } else {
          displayComment = _comment;
        }
        return GestureDetector(
          onTap: () {
            final token = Provider.of<AuthProvider>(context, listen: false).accessToken;
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => BlocProvider(
                  create: (_) => CommentDetailBloc(
                    commentService: CommentService(),
                    token: token,
                    navigatorKey: GlobalKey<NavigatorState>(),
                  )..add(LoadCommentDetail(displayComment.idComment)),
                  child: CommentDetailPage(commentId: displayComment.idComment),
                ),
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
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => UserProfilePage(userId: displayComment.person.idPerson),
                            ),
                          );
                        },
                        child: CircleAvatar(
                          radius: 20,
                          backgroundColor: Colors.blue.shade100,
                          child: Text(
                            displayComment.person.firstname.isNotEmpty 
                                ? displayComment.person.firstname[0].toUpperCase()
                                : 'U',
                            style: TextStyle(
                              color: Colors.blue.shade700,
                              fontWeight: FontWeight.bold,
                            ),
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
                              displayComment.person.displayName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              _formatTimeAgo(displayComment.createdAt),
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
                    displayComment.content,
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
                                      builder: (context) => CreateReplyModal(parentComment: displayComment),
                                    );
                                  }
                                : () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Connectez-vous pour répondre')),
                                    );
                                  },
                          ),
                          if (displayComment.replyCount > 0)
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
                                  '${displayComment.replyCount}',
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
                              displayComment.isLikedByCurrentUser ? Icons.favorite : Icons.favorite_border,
                              color: displayComment.isLikedByCurrentUser ? Colors.red : Colors.grey.shade600,
                              size: 22,
                            ),
                            tooltip: displayComment.isLikedByCurrentUser ? 'Retirer le like' : 'Liker',
                            onPressed: isAuthenticated
                                ? () {
                                    context.read<CommentItemBloc>().add(LikeComment());
                                  }
                                : () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Connectez-vous pour liker')),
                                    );
                                  },
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${displayComment.likeCount}',
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
} 