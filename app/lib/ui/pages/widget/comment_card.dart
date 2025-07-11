import 'package:flutter/material.dart';
import '../../../models/comment_model.dart';
import '../comment_detail_page.dart';
import 'create_reply_modal.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../user_profile_page.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../services/contact_service.dart';
import '../../../services/comment_flag_service.dart';
import '../../widgets/comment_image_widget.dart';
import '../../widgets/tag_selector_widget.dart';
import '../../widgets/flag_reason_dialog.dart';
import '../../widgets/user_mention_suggestions.dart';
import '../../../l10n/app_localizations.dart';

class CommentCard extends StatefulWidget {
  final Comment comment;
  final bool showReplies;
  final Function()? onLikeChanged;

  const CommentCard({
    super.key,
    required this.comment,
    this.showReplies = false,
    this.onLikeChanged,
  });

  @override
  State<CommentCard> createState() => _CommentCardState();
}

class _CommentCardState extends State<CommentCard> with TickerProviderStateMixin {
  late Comment _currentComment;
  bool _isUserBlocked = false;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _currentComment = widget.comment;
    _checkIfUserIsBlocked();
    
    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 0.95,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutBack,
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
  void didUpdateWidget(CommentCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.comment != widget.comment) {
      _currentComment = widget.comment;
    }
  }
  
  Future<void> _checkIfUserIsBlocked() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.currentUser?.idPerson;
    
    if (token != null && currentUserId != null) {
      try {
        final contactService = ContactService();
        final existingContact = await contactService.getContactStatus(
          userId: _currentComment.person.idPerson,
          token: token,
        );
        
        if (mounted) {
          setState(() {
            _isUserBlocked = existingContact?.isBlocked ?? false;
          });
        }
      } catch (e) {
        print('Error checking user block status: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final comment = _currentComment;
    final isAuthenticated = Provider.of<AuthProvider>(context, listen: false).isAuthenticated;
    final localizations = AppLocalizations.of(context)!;
    
    return BlocListener<CommentBloc, CommentState>(
      listener: (context, state) {
        if (state is CommentLikeUpdated && state.commentId == comment.idComment) {
          setState(() {
            _currentComment = _currentComment.copyWith(
              isLikedByCurrentUser: state.isLiked,
              likeCount: state.likeCount,
            );
          });
        }
      },
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: GestureDetector(
            onTap: () {
              _navigateToDetail(context);
            },
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              decoration: BoxDecoration(
                color: Colors.green[50],
                border: Border(
                  bottom: BorderSide(
                    color: Colors.grey[300]!,
                    width: 1,
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with user info and actions
                  Row(
                    children: [
                      // Avatar with gradient background
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
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.green[400]!, Colors.green[600]!],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.green[300]!.withValues(alpha: 0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              comment.person.firstname.isNotEmpty 
                                  ? comment.person.firstname[0].toUpperCase()
                                  : 'U',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      // User information
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  comment.person.displayName,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 16,
                                    color: Colors.grey[800],
                                  ),
                                ),
                                if (comment.tag != null) ...[
                                  const SizedBox(width: 8),
                                  TagDisplayWidget(
                                    tag: comment.tag!,
                                    isSmall: true,
                                  ),
                                ],
                                const SizedBox(width: 6),
                                Text(
                                  '· ${_formatTimeAgo(comment.createdAt)}',
                                  style: TextStyle(
                                    color: Colors.grey[500],
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Options menu
                      if (isAuthenticated)
                        PopupMenuButton<String>(
                          onSelected: (value) {
                            _handleMenuAction(context, value);
                          },
                          icon: Icon(
                            Icons.more_vert,
                            color: Colors.grey[600],
                            size: 20,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          itemBuilder: (context) => [
                            PopupMenuItem(
                              value: 'report',
                              child: Row(
                                children: [
                                  Icon(Icons.flag, size: 18, color: Colors.red[600]),
                                  const SizedBox(width: 12),
                                  Text(localizations.report),
                                ],
                              ),
                            ),
                            PopupMenuItem(
                              value: 'block',
                              child: Row(
                                children: [
                                  Icon(Icons.block, size: 18, color: Colors.red[600]),
                                  const SizedBox(width: 12),
                                  Text(_isUserBlocked ? localizations.unblock : localizations.block),
                                ],
                              ),
                            ),
                            if (comment.person.idPerson == Provider.of<AuthProvider>(context, listen: false).currentUser?.idPerson)
                              PopupMenuItem(
                                value: 'delete',
                                child: Row(
                                  children: [
                                    Icon(Icons.delete, size: 18, color: Colors.red[600]),
                                    const SizedBox(width: 12),
                                    Text(localizations.delete),
                                  ],
                                ),
                              ),
                          ],
                        ),
                    ],
                  ),
                  
                  // Content
                  if (comment.content.isNotEmpty) ...[
                                         Padding(
                       padding: const EdgeInsets.only(left: 64, right: 16),
                       child: MentionRichText(
                         text: comment.content,
                         mentions: comment.mentions,
                         textStyle: TextStyle(
                           fontSize: 16,
                           color: Colors.grey[800],
                           height: 1.5,
                         ),
                         onMentionTap: (userId) {
                           Navigator.push(
                             context,
                             MaterialPageRoute(
                               builder: (context) => UserProfilePage(userId: userId),
                             ),
                           );
                         },
                       ),
                     ),
                  ],
                  
                  // Image if present
                  if (comment.imageUrl != null && comment.imageUrl!.isNotEmpty) ...[
                                         Padding(
                       padding: const EdgeInsets.only(left: 64, right: 16),
                       child: CommentImageWidget(
                         imageUrl: comment.imageUrl!,
                       ),
                     ),
                  ],
                  
                  // Action buttons
                  Padding(
                    padding: const EdgeInsets.only(left: 64, right: 16),
                    child: Row(
                      children: [
                                                 // Like button
                         _buildActionButton(
                           icon: comment.isLikedByCurrentUser 
                               ? Icons.favorite 
                               : Icons.favorite_border,
                           label: comment.likeCount > 0 ? comment.likeCount.toString() : '',
                           color: comment.isLikedByCurrentUser ? Colors.red[500]! : Colors.grey[600]!,
                           onTap: () => _handleLike(context),
                         ),
                         const SizedBox(width: 16),
                         // Reply button
                         _buildActionButton(
                           icon: Icons.mode_comment_outlined,
                           label: comment.replyCount > 0 ? comment.replyCount.toString() : '',
                           color: Colors.grey[600]!,
                           onTap: () => _handleReply(context),
                         ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
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

  void _navigateToDetail(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CommentDetailPage(commentId: _currentComment.idComment),
      ),
    );
  }

  void _handleLike(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(localizations.loginToLike),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

         context.read<CommentBloc>().add(
       LikeComment(
         _currentComment.idComment,
         authProvider.currentUser!.idPerson.toString(),
       ),
     );
  }

  void _handleReply(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(localizations.loginToReply),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => CreateReplyModal(
        parentComment: _currentComment,
      ),
    );
  }

  

  void _handleMenuAction(BuildContext context, String action) {
    switch (action) {
      case 'report':
        _handleReport(context);
        break;
      case 'block':
        _handleBlock(context);
        break;
      case 'delete':
        _handleDelete(context);
        break;
    }
  }

  void _handleReport(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(localizations.loginToReport),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

         showDialog(
       context: context,
       builder: (context) => FlagReasonDialog(
         onFlag: (reason, details) {
           _flagComment(context, reason, details);
         },
       ),
     );
  }

  void _handleBlock(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
    if (authProvider.accessToken == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(localizations.authTokenMissing),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(_isUserBlocked ? localizations.unblockUser : localizations.blockUser),
        content: Text(
          _isUserBlocked 
              ? localizations.unblockUserConfirmation
              : localizations.blockUserConfirmation,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(localizations.cancel),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _performBlockAction(context);
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: Text(_isUserBlocked ? localizations.unblock : localizations.block),
          ),
        ],
      ),
    );
  }

  void _handleDelete(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(localizations.loginToDelete),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(localizations.deletePost),
        content: Text(localizations.deletePostConfirmation),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(localizations.cancel),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _performDelete(context);
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: Text(localizations.delete),
          ),
        ],
      ),
    );
  }

     Future<void> _flagComment(BuildContext context, String reason, String? details) async {
     final authProvider = Provider.of<AuthProvider>(context, listen: false);
     final localizations = AppLocalizations.of(context)!;
     
     try {
       final commentFlagService = CommentFlagService();
       final result = await commentFlagService.flagComment(
         commentId: _currentComment.idComment,
         idPerson: authProvider.currentUser!.idPerson,
         reason: reason,
         details: details,
         token: authProvider.accessToken!,
       );
       
       ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(
           content: Text(localizations.reportSubmitted),
           backgroundColor: Colors.green,
         ),
       );
     } catch (e) {
       ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(
           content: Text(localizations.reportError),
           backgroundColor: Colors.red,
         ),
       );
     }
   }

   Future<void> _performBlockAction(BuildContext context) async {
     final authProvider = Provider.of<AuthProvider>(context, listen: false);
     final localizations = AppLocalizations.of(context)!;
     
     try {
       final contactService = ContactService();
       
       // First get the contact status to get the contact ID
       final existingContact = await contactService.getContactStatus(
         userId: _currentComment.person.idPerson,
         token: authProvider.accessToken!,
       );
       
       if (_isUserBlocked) {
         if (existingContact != null) {
           await contactService.unblockUser(
             contactId: existingContact.id,
             token: authProvider.accessToken!,
           );
         }
         
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(
             content: Text(localizations.userUnblockedSuccess(_currentComment.person.displayName)),
             backgroundColor: Colors.green,
           ),
         );
       } else {
         if (existingContact != null) {
           await contactService.blockUser(
             contactId: existingContact.id,
             token: authProvider.accessToken!,
           );
         } else {
           // Create contact and block
           final newContact = await contactService.sendFriendRequest(
             receiverId: _currentComment.person.idPerson,
             token: authProvider.accessToken!,
           );
           await contactService.blockUser(
             contactId: newContact.id,
             token: authProvider.accessToken!,
           );
         }
         
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(
             content: Text(localizations.userBlockedSuccess(_currentComment.person.displayName)),
             backgroundColor: Colors.green,
           ),
         );
       }
       
       setState(() {
         _isUserBlocked = !_isUserBlocked;
       });
     } catch (e) {
       ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(
           content: Text(_isUserBlocked ? localizations.unblockError : localizations.blockError),
           backgroundColor: Colors.red,
         ),
       );
     }
   }

  Future<void> _performDelete(BuildContext context) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
         try {
       context.read<CommentBloc>().add(
         DeleteComment(_currentComment.idComment),
       );
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(localizations.postDeleted),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
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

class TagDisplayWidget extends StatelessWidget {
  final String tag;
  final bool isSmall;

  const TagDisplayWidget({
    super.key,
    required this.tag,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    Color tagColor;
    String displayText;
    
    switch (tag.toLowerCase()) {
      case 'conversation':
        tagColor = Colors.blue[600]!;
        displayText = localizations.conversation;
        break;
      case 'advice':
        tagColor = Colors.green[600]!;
        displayText = localizations.advice;
        break;
      default:
        tagColor = Colors.grey[600]!;
        displayText = tag;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 12,
        vertical: isSmall ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: tagColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(isSmall ? 12 : 16),
        border: Border.all(
          color: tagColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: isSmall ? 11 : 12,
          fontWeight: FontWeight.w600,
          color: tagColor,
        ),
      ),
    );
  }
} 