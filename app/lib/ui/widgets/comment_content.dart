import 'package:flutter/material.dart';
import '../../models/comment_model.dart';
import 'comment_image_widget.dart';
import 'tag_selector_widget.dart';
import 'comment_options_menu.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../pages/user_profile_page.dart';
import '../../l10n/app_localizations.dart';

class CommentContent extends StatelessWidget {
  final Comment comment;
  final Function()? onLike;
  final Function()? onReply;
  final bool isThread;
  final bool showOptions;
  final bool showReplyLabel;

  const CommentContent({
    super.key,
    required this.comment,
    this.onLike,
    this.onReply,
    this.isThread = false,
    this.showOptions = true,
    this.showReplyLabel = false,
  });

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
          padding: const EdgeInsets.only(top: 6, bottom: 2),
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

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = Provider.of<AuthProvider>(context, listen: false).isAuthenticated;
    final localizations = AppLocalizations.of(context)!;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
      decoration: BoxDecoration(
        color: Colors.green[50],
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar column with thread line
          Column(
            children: [
              // Avatar
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => UserProfilePage(userId: comment.person.idPerson),
                    ),
                  );
                },
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.green[200]!.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
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
              ),
              // Thread line
              if (isThread)
                Container(
                  width: 2,
                  height: 24,
                  margin: const EdgeInsets.only(top: 2),
                  color: Colors.grey[300],
                ),
            ],
          ),
          const SizedBox(width: 12),
          
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Author info row with inline tag
                Row(
                  children: [
                    Expanded(
                      child: Row(
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
                          if (comment.tag != null && !isThread) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: _getTagColor(comment.tag!).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: _getTagColor(comment.tag!).withOpacity(0.3),
                                ),
                              ),
                              child: Text(
                                _getTagDisplayName(comment.tag!, context),
                                style: TextStyle(
                                  color: _getTagColor(comment.tag!),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                          const SizedBox(width: 4),
                          Text(
                            '· ${_formatTimeAgo(context, comment.createdAt)}',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (showOptions) ...[
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
                  ],
                ),
                
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
                          color: Colors.black.withValues(alpha: 0.05),
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
                Row(
                  children: [
                    // Like button
                    _buildActionButton(
                      icon: comment.isLikedByCurrentUser 
                        ? Icons.favorite
                        : Icons.favorite_border,
                      label: comment.likeCount > 0 ? comment.likeCount.toString() : '',
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
                        if (onLike != null) onLike!();
                      },
                    ),
                    const SizedBox(width: 16),
                    
                    // Reply button
                    _buildActionButton(
                      icon: Icons.mode_comment_outlined,
                      label: showReplyLabel ? localizations.reply : (comment.replyCount > 0 ? comment.replyCount.toString() : ''),
                      color: Colors.grey[500]!,
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
                        if (onReply != null) onReply!();
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

  Color _getTagColor(String tag) {
    switch (tag.toLowerCase()) {
      case 'conversation':
        return Colors.blue[600]!;
      case 'conseil':
        return Colors.green[600]!;
      default:
        return Colors.grey[600]!;
    }
  }

  String _getTagDisplayName(String tag, BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    switch (tag.toLowerCase()) {
      case 'conversation':
        return localizations.conversation;
      case 'conseil':
        return localizations.advice;
      default:
        return tag;
    }
  }
} 