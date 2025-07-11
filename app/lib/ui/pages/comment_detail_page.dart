import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../widgets/thread_view.dart';
import '../../providers/auth_provider.dart';
import '../../models/comment_model.dart';
import 'widget/create_reply_modal.dart';
import 'package:provider/provider.dart';
import '../../l10n/app_localizations.dart';

class CommentDetailPage extends StatefulWidget {
  final int commentId;
  const CommentDetailPage({super.key, required this.commentId});

  @override
  State<CommentDetailPage> createState() => _CommentDetailPageState();
}

class _CommentDetailPageState extends State<CommentDetailPage> {
  @override
  void initState() {
    super.initState();
    _loadThread();
  }

  void _loadThread() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final reqId = DateTime.now().millisecondsSinceEpoch.toString();
    context.read<CommentBloc>().add(LoadCommentDetail(widget.commentId, userId: authProvider.userId, requestId: reqId));
  }

  void _handleLike(Comment comment) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.currentUser?.idPerson != null) {
      context.read<CommentBloc>().add(
        LikeComment(
          comment.idComment,
          authProvider.currentUser!.idPerson.toString(),
        ),
      );
    }
  }

  void _handleReply(Comment comment) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreateReplyModal(parentComment: comment),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return BlocListener<CommentBloc, CommentState>(
      listener: (context, state) {
        if (state is CommentError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red[400],
            ),
          );
        } else if (state is CommentDeleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(localizations.commentDeleted),
              backgroundColor: Colors.green[600],
            ),
          );
          Navigator.pop(context);
        }
      },
      child: BlocBuilder<CommentBloc, CommentState>(
        builder: (context, state) {
          String title = localizations.threadTitle;
          if (state is CommentThreadLoaded && state.threadHierarchy.isNotEmpty) {
            title = state.threadHierarchy[0].person.displayName;
          }

          return Scaffold(
            backgroundColor: Colors.green[50],
            appBar: AppBar(
              title: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.w600,
                      fontSize: 18,
                    ),
                  ),
                  if (state is CommentThreadLoaded && state.threadHierarchy.isNotEmpty)
                    Text(
                      localizations.post,
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w400,
                        fontSize: 14,
                      ),
                    ),
                ],
              ),
              backgroundColor: Colors.green[50],
              surfaceTintColor: Colors.green[50],
              elevation: 0,
              iconTheme: const IconThemeData(color: Colors.black87),
              centerTitle: false,
            ),
            body: RefreshIndicator(
              color: Colors.green[600],
              onRefresh: () async {
                _loadThread();
              },
              child: Builder(
                builder: (context) {
                  if (state is CommentLoading) {
                    final cached = context.read<CommentBloc>().currentThreadHierarchy;
                    if (cached.isNotEmpty) {
                      return Stack(
                        children: [
                          ThreadView(
                            threadHierarchy: cached,
                            onLike: _handleLike,
                            onReply: _handleReply,
                          ),
                          const Positioned(
                            top: 0,
                            left: 0,
                            right: 0,
                            child: LinearProgressIndicator(minHeight: 2),
                          ),
                        ],
                      );
                    }
                    return Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.green[600]!),
                      ),
                    );
                  }

                  if (state is CommentError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            localizations.loadingError,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[800],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            state.message,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          TextButton.icon(
                            onPressed: _loadThread,
                            icon: Icon(Icons.refresh, color: Colors.green[600]),
                            label: Text(
                              localizations.retry,
                              style: TextStyle(
                                color: Colors.green[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  if (state is CommentThreadLoaded) {
                    if (state.threadHierarchy.isEmpty) {
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
                              localizations.noComments,
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

                    return ThreadView(
                      threadHierarchy: state.threadHierarchy,
                      onLike: _handleLike,
                      onReply: _handleReply,
                    );
                  }

                  return const SizedBox.shrink();
                },
              ),
            ),
          );
        },
      ),
    );
  }
} 