import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../models/comment_model.dart';
import '../../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'edit_comment_modal.dart';
import '../../../l10n/app_localizations.dart';

class CommentOptionsMenu extends StatelessWidget {
  final Comment comment;
  final VoidCallback? onDelete;
  final VoidCallback? onReport;
  final VoidCallback? onBlockUser;
  final bool isUserBlocked;
  
  const CommentOptionsMenu({
    super.key,
    required this.comment,
    this.onDelete,
    this.onReport,
    this.onBlockUser,
    this.isUserBlocked = false,
  });

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isCurrentUserComment = authProvider.currentUser?.idPerson == comment.person.idPerson;
    
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.green[400]!, Colors.green[600]!],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Text(
                      comment.person.firstname.isNotEmpty
                          ? comment.person.firstname[0].toUpperCase()
                          : 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        comment.person.displayName,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[800],
                        ),
                      ),
                      Text(
                        _formatTimeAgo(comment.createdAt),
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: Icon(
                    Icons.close,
                    color: Colors.grey[600],
                    size: 24,
                  ),
                ),
              ],
            ),
          ),
          
          // Options
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Column(
              children: [
                // Like/Unlike
                _buildOptionTile(
                  context: context,
                  icon: comment.isLikedByCurrentUser ? Icons.favorite : Icons.favorite_border,
                  title: comment.isLikedByCurrentUser ? localizations.unlike : localizations.like,
                  color: comment.isLikedByCurrentUser ? Colors.red[600]! : Colors.grey[600]!,
                  onTap: () {
                    Navigator.of(context).pop();
                    // Handle like/unlike
                  },
                ),
                
                // Reply
                _buildOptionTile(
                  context: context,
                  icon: Icons.reply,
                  title: localizations.reply,
                  color: Colors.grey[600]!,
                  onTap: () {
                    Navigator.of(context).pop();
                    // Handle reply
                  },
                ),
                
                // Share
                _buildOptionTile(
                  context: context,
                  icon: Icons.share,
                  title: localizations.share,
                  color: Colors.grey[600]!,
                  onTap: () {
                    Navigator.of(context).pop();
                    _shareComment(context);
                  },
                ),
                
                // Copy text
                _buildOptionTile(
                  context: context,
                  icon: Icons.copy,
                  title: 'Copy text',
                  color: Colors.grey[600]!,
                  onTap: () {
                    Navigator.of(context).pop();
                    _copyCommentText(context);
                  },
                ),
                
                // Edit (only for current user's comments)
                if (isCurrentUserComment)
                  _buildOptionTile(
                    context: context,
                    icon: Icons.edit,
                    title: localizations.edit,
                    color: Colors.blue[600]!,
                    onTap: () {
                      Navigator.of(context).pop();
                      _showEditModal(context);
                    },
                  ),
                
                // Delete (only for current user's comments)
                if (isCurrentUserComment)
                  _buildOptionTile(
                    context: context,
                    icon: Icons.delete,
                    title: localizations.delete,
                    color: Colors.red[600]!,
                    onTap: () {
                      Navigator.of(context).pop();
                      _showDeleteConfirmation(context);
                    },
                  ),
                
                // Report (not for current user's comments)
                if (!isCurrentUserComment)
                  _buildOptionTile(
                    context: context,
                    icon: Icons.flag,
                    title: 'Report',
                    color: Colors.orange[600]!,
                    onTap: () {
                      Navigator.of(context).pop();
                      if (onReport != null) {
                        onReport!();
                      }
                    },
                  ),
                
                // Block/Unblock user (not for current user's comments)
                if (!isCurrentUserComment)
                  _buildOptionTile(
                    context: context,
                    icon: isUserBlocked ? Icons.person_add : Icons.person_off,
                    title: isUserBlocked ? 'Unblock user' : 'Block user',
                    color: isUserBlocked ? Colors.green[600]! : Colors.red[600]!,
                    onTap: () {
                      Navigator.of(context).pop();
                      if (onBlockUser != null) {
                        onBlockUser!();
                      }
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOptionTile({
    required BuildContext context,
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            children: [
              Icon(
                icon,
                color: color,
                size: 24,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[800],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _shareComment(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final shareText = '${comment.person.displayName}: ${comment.content}';
    
    // For now, just copy to clipboard
    Clipboard.setData(ClipboardData(text: shareText));
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Comment copied to clipboard'),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _copyCommentText(BuildContext context) {
    Clipboard.setData(ClipboardData(text: comment.content));
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Text copied to clipboard'),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showEditModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EditCommentModal(comment: comment),
    );
  }

  void _showDeleteConfirmation(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.delete, color: Colors.red[600]),
            const SizedBox(width: 8),
            Text('Delete post'),
          ],
        ),
        content: Text('Are you sure you want to delete this post? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              if (onDelete != null) {
                onDelete!();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: Text('Delete'),
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'now';
    }
  }
} 