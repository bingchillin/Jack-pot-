import 'package:flutter/material.dart';
import '../../../models/comment_model.dart';
import '../comment_detail_page.dart';
import 'create_reply_modal_redesigned.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../../widgets/comment_content.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

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
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _currentComment = widget.comment;
    
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

  void _handleLike() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.currentUser?.idPerson != null) {
      context.read<CommentBloc>().add(
        LikeComment(
          _currentComment.idComment,
          authProvider.currentUser!.idPerson.toString(),
        ),
      );
      if (widget.onLikeChanged != null) {
        widget.onLikeChanged!();
      }
    }
  }

  void _handleReply() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreateReplyModalRedesigned(parentComment: _currentComment),
    );
  }

  void _navigateToDetail() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CommentDetailPage(commentId: _currentComment.idComment),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CommentBloc, CommentState>(
      listener: (context, state) {
        if (state is CommentLikeUpdated && state.commentId == _currentComment.idComment) {
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
            onTap: _navigateToDetail,
            child: CommentContent(
              comment: _currentComment,
              onLike: _handleLike,
              onReply: _handleReply,
              isThread: false,
              showOptions: true,
              showReplyLabel: false,
            ),
          ),
        ),
      ),
    );
  }
} 