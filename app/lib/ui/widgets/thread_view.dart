import 'package:flutter/material.dart';
import '../../models/comment_model.dart';
import 'comment_content.dart';
import '../../l10n/app_localizations.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

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
    final isRootComment = index == 0;

    return Column(
      children: [
        CommentContent(
          comment: comment,
          onLike: onLike != null ? () => onLike!(comment) : null,
          onReply: onReply != null ? () => onReply!(comment) : null,
          isThread: !isRootComment, // Show thread line for all replies
          showOptions: true,
          showReplyLabel: false,
        ),
        
        // Twitter-like "Post your answer" section (only for root comment)
        if (isRootComment) ...[
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            decoration: BoxDecoration(
              color: Colors.green[50], // Changed from white to match the rest
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
                      if (onReply != null) onReply!(comment);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.grey[300]!,
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
        
        // No nested rendering needed - all replies are already in the flat hierarchy
      ],
    );
  }
} 