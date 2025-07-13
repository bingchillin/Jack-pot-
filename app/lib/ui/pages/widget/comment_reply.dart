import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../models/comment_model.dart';
import '../../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'create_reply_modal_redesigned.dart';
import 'comment_options_menu.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../../../l10n/app_localizations.dart';

class CommentReply extends StatefulWidget {
  final Comment reply;
  final Comment parentComment;
  final VoidCallback? onDelete;
  final VoidCallback? onReport;
  final VoidCallback? onBlockUser;
  final bool isUserBlocked;

  const CommentReply({
    super.key,
    required this.reply,
    required this.parentComment,
    this.onDelete,
    this.onReport,
    this.onBlockUser,
    this.isUserBlocked = false,
  });

  @override
  State<CommentReply> createState() => _CommentReplyState();
}

class _CommentReplyState extends State<CommentReply> with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;
  bool _isLiked = false;
  int _likeCount = 0;

  @override
  void initState() {
    super.initState();
    
    // Initialize with comment data
    _isLiked = widget.reply.isLikedByCurrentUser;
    _likeCount = widget.reply.likeCount;
    
    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _slideAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn,
    ));
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isCurrentUserReply = authProvider.currentUser?.idPerson == widget.reply.person.idPerson;
    
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(20 * (1 - _slideAnimation.value), 0),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Container(
              margin: const EdgeInsets.only(left: 40, top: 8, bottom: 8),
      decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[200]!),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
            children: [
                        // User avatar
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.green[400]!, Colors.green[600]!],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                child: Text(
                              widget.reply.person.firstname.isNotEmpty
                                  ? widget.reply.person.firstname[0].toUpperCase()
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
                        
                        // User info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                                widget.reply.person.displayName,
                                style: TextStyle(
                                  fontSize: 14,
                        fontWeight: FontWeight.w600,
                                  color: Colors.grey[800],
                      ),
                    ),
                    Text(
                                _formatTimeAgo(widget.reply.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                                  color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ),
                        
                        // Options menu
                        if (authProvider.isAuthenticated)
                          GestureDetector(
                            onTap: () => _showOptionsMenu(context),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.grey[100],
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Icon(
                                Icons.more_horiz,
                                size: 20,
                                color: Colors.grey[600],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  // Content
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                        // Reply text
                        Text(
                          widget.reply.content,
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.grey[800],
                            height: 1.4,
                          ),
                        ),
                        
                        // Image (if any)
                        if (widget.reply.imageUrl != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            width: double.infinity,
                            height: 150,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey[200]!),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.asset(
                                widget.reply.imageUrl!,
                                width: double.infinity,
                                height: 150,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        ],
                        
                        const SizedBox(height: 16),
                        
                        // Actions
                        Row(
                          children: [
                            // Like button
                            _buildActionButton(
                              icon: _isLiked ? Icons.favorite : Icons.favorite_border,
                              label: _likeCount > 0 ? _likeCount.toString() : '',
                              color: _isLiked ? Colors.red[500]! : Colors.grey[600]!,
                              onTap: () => _handleLike(context),
                            ),
                            
                            const SizedBox(width: 20),
                            
                            // Reply button
                            _buildActionButton(
                              icon: Icons.reply,
                              label: '',
                              color: Colors.grey[600]!,
                              onTap: () => _handleReply(context),
                            ),
                            
                            
                            
                            const Spacer(),
                            
                            // Edit indicator
                            if (widget.reply.updatedAt != null && 
                                widget.reply.updatedAt!.isAfter(widget.reply.createdAt))
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.grey[100],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'edited',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[500],
                                    fontStyle: FontStyle.italic,
                                  ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
                  ),
                  
                  const SizedBox(height: 16),
                  ],
                ),
              ),
          ),
        );
      },
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(8),
        ),
                child: Row(
          mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
              icon,
              size: 18,
              color: color,
                    ),
            if (label.isNotEmpty) ...[
                    const SizedBox(width: 4),
                    Text(
                label,
                      style: TextStyle(
                        fontSize: 12,
                  color: color,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ],
          ),
      ),
    );
  }

  void _handleLike(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please log in to like comments'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    
    setState(() {
      _isLiked = !_isLiked;
      _likeCount += _isLiked ? 1 : -1;
    });
    
    // Haptic feedback
    HapticFeedback.lightImpact();
    
    // Send like event
    context.read<CommentBloc>().add(
      LikeComment(
        widget.reply.idComment,
        authProvider.currentUser!.idPerson.toString(),
      ),
    );
  }

  void _handleReply(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please log in to reply'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreateReplyModalRedesigned(parentComment: widget.reply),
    );
  }

  

  void _showOptionsMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => CommentOptionsMenu(
        comment: widget.reply,
        onDelete: widget.onDelete,
        onReport: widget.onReport,
        onBlockUser: widget.onBlockUser,
        isUserBlocked: widget.isUserBlocked,
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'now';
    }
  }
} 