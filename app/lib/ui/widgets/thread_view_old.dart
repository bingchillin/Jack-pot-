import 'package:flutter/material.dart';
import '../../models/comment_model.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';
import 'comment_content.dart';
import '../pages/widget/create_reply_modal_redesigned.dart';

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
                fontWeight: FontWeight.w600,
                color: Colors.grey[800],
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
      itemBuilder: (context, index) {
        final comment = threadHierarchy[index];
        return _buildCommentThread(context, comment, index);
      },
    );
  }

  Widget _buildCommentThread(BuildContext context, Comment comment, int index) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isAuthenticated = authProvider.isAuthenticated;

    return Container(
      margin: EdgeInsets.only(
        left: comment.level * 16.0, // Indentation based on level
        bottom: 8.0,
      ),
      child: Column(
        children: [
          // Connection line for nested comments
          if (comment.level > 0) _buildConnectionLine(comment.level),
          
          // Comment card with improved design
          Container(
            decoration: BoxDecoration(
              color: _getCommentBackgroundColor(comment.level),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _getCommentBorderColor(comment.level),
                width: comment.level == 0 ? 2 : 1,
              ),
              boxShadow: [
                if (comment.level == 0)
                  BoxShadow(
                    color: Colors.green.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
              ],
            ),
            child: CommentContent(
              comment: comment,
              onLike: () => onLike?.call(comment),
              onReply: () => onReply?.call(comment),
              isThread: true,
              showOptions: true,
              showReplyLabel: false,
            ),
          ),
          
          // Twitter-like "Post your answer" section (only for root comment)
          if (comment.level == 0) ...[
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.08),
                border: Border(
                  bottom: BorderSide(
                    color: Colors.green.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User avatar
                  Container(
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
                      child: isAuthenticated 
                        ? Text(
                            authProvider.firstName?.isNotEmpty == true
                              ? authProvider.firstName![0].toUpperCase()
                              : 'U',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.person, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // Reply input area
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        if (onReply != null) {
                          onReply!(comment);
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
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.green.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.green.withValues(alpha: 0.3),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                'Post your answer...',
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ),
                            Icon(
                              Icons.send,
                              size: 20,
                              color: Colors.green[600],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          // Render child comments recursively
          if (comment.hasChildren) ...[
            ...comment.children.map((child) => _buildCommentThread(context, child, index + 1)),
          ],
        ],
      ),
    );
  }

  Widget _buildConnectionLine(int level) {
    return Container(
      margin: const EdgeInsets.only(left: 20, bottom: 4),
      child: Row(
        children: [
          // Vertical line
          Container(
            width: 2,
            height: 16,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.green.withValues(alpha: 0.3),
                  Colors.green.withValues(alpha: 0.6),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          // Horizontal line
          Container(
            width: 12,
            height: 2,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.green.withValues(alpha: 0.6),
                  Colors.green.withValues(alpha: 0.3),
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getCommentBackgroundColor(int level) {
    switch (level) {
      case 0:
        return Colors.white;
      case 1:
        return Colors.green.withValues(alpha: 0.02);
      case 2:
        return Colors.green.withValues(alpha: 0.04);
      case 3:
        return Colors.green.withValues(alpha: 0.06);
      default:
        return Colors.green.withValues(alpha: 0.08);
    }
  }

  Color _getCommentBorderColor(int level) {
    switch (level) {
      case 0:
        return Colors.green.withValues(alpha: 0.3);
      case 1:
        return Colors.green.withValues(alpha: 0.2);
      case 2:
        return Colors.green.withValues(alpha: 0.15);
      case 3:
        return Colors.green.withValues(alpha: 0.1);
      default:
        return Colors.green.withValues(alpha: 0.05);
    }
  }

  Widget _buildCommentContent(BuildContext context, Comment comment) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isAuthenticated = authProvider.isAuthenticated;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // User info and timestamp
          Row(
            children: [
              // Avatar with level-based styling
              GestureDetector(
                onTap: () {
                  // TODO: Navigate to user profile
                },
                child: Container(
                  width: comment.level == 0 ? 48 : 40,
                  height: comment.level == 0 ? 48 : 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: comment.level == 0 
                          ? [Colors.green[400]!, Colors.green[600]!]
                          : [Colors.green[300]!, Colors.green[500]!],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.green.withValues(alpha: 0.3),
                        blurRadius: comment.level == 0 ? 8 : 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      comment.person.displayName.isNotEmpty 
                          ? comment.person.displayName[0].toUpperCase()
                          : 'U',
                      style: TextStyle(
                        fontSize: comment.level == 0 ? 20 : 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              
              // User name and timestamp
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      comment.person.displayName,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: comment.level == 0 ? 16 : 15,
                        color: Colors.grey[800],
                        letterSpacing: 0.2,
                      ),
                    ),
                    Text(
                      _formatTimeAgo(comment.createdAt),
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ),
              
              // Options menu
              IconButton(
                icon: Icon(
                  Icons.more_horiz,
                  color: Colors.grey[400],
                  size: 20,
                ),
                onPressed: () {
                  // TODO: Show options menu
                },
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                splashRadius: 20,
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // Tag for root comments
          if (comment.tag != null && comment.level == 0) ...[
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getTagColor(comment.tag!).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _getTagColor(comment.tag!).withValues(alpha: 0.3),
                ),
              ),
              child: Text(
                comment.tag!,
                style: TextStyle(
                  color: _getTagColor(comment.tag!),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
          
          // Comment content
          Text(
            comment.content,
            style: TextStyle(
              fontSize: comment.level == 0 ? 16 : 15,
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
                child: Image.network(
                  comment.imageUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 100,
                      color: Colors.grey[200],
                      child: const Center(
                        child: Icon(Icons.broken_image, color: Colors.grey),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
          
          const SizedBox(height: 12),
          
          // Action buttons
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
                        content: const Text('Connectez-vous pour liker'),
                        backgroundColor: Colors.orange[600],
                      ),
                    );
                    return;
                  }
                  if (onLike != null) onLike!(comment);
                },
              ),
              const SizedBox(width: 16),
              
              // Reply button
              _buildActionButton(
                icon: Icons.mode_comment_outlined,
                label: comment.replyCount > 0 ? comment.replyCount.toString() : '',
                color: Colors.grey[500]!,
                onTap: () {
                  if (!isAuthenticated) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Connectez-vous pour repondre'),
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

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}j';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'maintenant';
    }
  }
}