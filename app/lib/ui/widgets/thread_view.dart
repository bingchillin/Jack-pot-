import 'package:flutter/material.dart';
import '../../models/comment_model.dart';
import 'comment_image_widget.dart';
import 'tag_selector_widget.dart';
import 'comment_options_menu.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../../l10n/app_localizations.dart';

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
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              AppLocalizations.of(context)!.noComments,
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: threadHierarchy.length,
      itemBuilder: (context, index) => _buildCommentThread(context, threadHierarchy[index]),
    );
  }

  Widget _buildCommentThread(BuildContext context, Comment comment) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildComment(context, comment),
        if (comment.hasChildren)
          Container(
            margin: const EdgeInsets.only(left: 32),
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(
                  color: Colors.green[100]!,
                  width: 2,
                ),
              ),
            ),
            child: Column(
              children: comment.children.map((child) => _buildCommentThread(context, child)).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildComment(BuildContext context, Comment comment) {
    final isAuthenticated = Provider.of<AuthProvider>(context, listen: false).isAuthenticated;
    final localizations = AppLocalizations.of(context)!;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[100]!,
            width: 1,
          ),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.green[200]!.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: CircleAvatar(
              radius: 20,
              backgroundColor: Colors.green[600],
              child: Text(
                comment.person.displayName.isNotEmpty 
                  ? comment.person.displayName[0].toUpperCase()
                  : 'U',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Author info
                Row(
                  children: [
                    Text(
                      comment.person.displayName,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                        color: Colors.grey[800],
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '· ${_formatTimeAgo(context, comment.createdAt)}',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[500],
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: Icon(
                        Icons.more_horiz,
                        color: Colors.grey[400],
                        size: 20,
                      ),
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          backgroundColor: Colors.transparent,
                          builder: (context) => CommentOptionsMenu(
                            comment: comment,
                            onDelete: () {
                              Navigator.pop(context);
                              context.read<CommentBloc>().add(DeleteComment(comment.idComment));
                            },
                          ),
                        );
                      },
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      splashRadius: 20,
                    ),
                  ],
                ),
                
                // Tag if present
                if (comment.tag != null && comment.level == 0) ...[
                  const SizedBox(height: 4),
                  TagDisplayWidget(
                    tag: comment.tag!,
                    isSmall: true,
                  ),
                ],
                
                // Content
                const SizedBox(height: 8),
                Text(
                  comment.content,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.4,
                    color: Colors.grey[800],
                  ),
                ),
                
                // Image if present
                if (comment.imageUrl != null && comment.imageUrl!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: CommentImageWidget(imageUrl: comment.imageUrl!),
                    ),
                  ),
                ],
                
                // Actions
                const SizedBox(height: 12),
                Row(
                  children: [
                    // Like button
                    _buildActionButton(
                      icon: comment.isLikedByCurrentUser 
                        ? Icons.favorite
                        : Icons.favorite_border,
                      label: comment.likeCount.toString(),
                      color: comment.isLikedByCurrentUser 
                        ? Colors.red[400]!
                        : Colors.grey[500]!,
                      onTap: () {
                        if (!isAuthenticated) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(localizations.loginToLike),
                              backgroundColor: Colors.orange[600],
                            ),
                          );
                          return;
                        }
                        if (onLike != null) onLike!(comment);
                      },
                    ),
                    const SizedBox(width: 24),
                    
                    // Reply button
                    _buildActionButton(
                      icon: Icons.reply,
                      label: localizations.reply,
                      color: Colors.green[600]!,
                      onTap: () {
                        if (!isAuthenticated) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(localizations.loginToReply),
                              backgroundColor: Colors.orange[600],
                            ),
                          );
                          return;
                        }
                        if (onReply != null) onReply!(comment);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 18, color: color),
              if (label.isNotEmpty) ...[
                const SizedBox(width: 6),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: color,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatTimeAgo(BuildContext context, DateTime dateTime) {
    final localizations = AppLocalizations.of(context)!;
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}${localizations.daysAgo}';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}${localizations.hoursAgo}';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}${localizations.minutesAgo}';
    } else {
      return localizations.justNow;
    }
  }
} 