import 'package:flutter/material.dart';
import '../../models/comment_model.dart';
import 'comment_image_widget.dart';
import 'tag_selector_widget.dart';
import 'comment_options_menu.dart';
import '../pages/widget/create_reply_modal_redesigned.dart';
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
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20, color: color),
              if (label.isNotEmpty) ...[
                const SizedBox(width: 6),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
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
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
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
                      child: Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(
                            comment.person.displayName,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                              color: Colors.grey[800],
                              letterSpacing: 0.1,
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
                          const SizedBox(width: 6),
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
                          final authProvider = Provider.of<AuthProvider>(context, listen: false);
                          final currentUserId = authProvider.currentUser?.idPerson;
                          
                          if (currentUserId == null || currentUserId != comment.idPerson) {
                            // Show report/flag options for other users' comments
                            _showReportMenu(context);
                          } else {
                            // Show edit/delete options for own comments
                            _showOwnerMenu(context);
                          }
                        },
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        splashRadius: 20,
                      ),
                    ],
                  ],
                ),
                
                // Content
                const SizedBox(height: 10),
                Text(
                  comment.content,
                  style: TextStyle(
                    fontSize: 16,
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
                
                // Action buttons
                const SizedBox(height: 12),
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
                    
                    const SizedBox(width: 20),
                    
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
                        if (onReply != null) {
                          onReply!();
                        } else {
                          // Default reply action using redesigned modal
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => CreateReplyModalRedesigned(parentComment: comment),
                          );
                        }
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

  void _showOwnerMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              // Edit option
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.edit,
                    color: Colors.blue[600],
                    size: 20,
                  ),
                ),
                title: const Text('Edit Comment'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Implement edit functionality
                },
              ),
              
              // Delete option
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.delete,
                    color: Colors.red[600],
                    size: 20,
                  ),
                ),
                title: const Text('Delete Comment'),
                onTap: () {
                  Navigator.pop(context);
                  _showDeleteConfirmation(context);
                },
              ),
              
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  void _showReportMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              // Report option
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.flag,
                    color: Colors.orange[600],
                    size: 20,
                  ),
                ),
                title: const Text('Report Comment'),
                subtitle: const Text('Report inappropriate content'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Implement report functionality
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Report functionality coming soon'),
                      backgroundColor: Colors.orange,
                    ),
                  );
                },
              ),
              
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Comment'),
        content: const Text(
          'Are you sure you want to delete this comment? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<CommentBloc>().add(DeleteComment(comment.idComment));
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
} 