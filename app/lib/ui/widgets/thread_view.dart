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
              child: Column(
                children: [
                  Row(
                    children: [
                      // Current user avatar
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [Colors.green[400]!, Colors.green[600]!],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            authProvider.firstName?.isNotEmpty == true
                                ? authProvider.firstName![0].toUpperCase()
                                : 'U',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      
                      // Reply input placeholder
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
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
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
}