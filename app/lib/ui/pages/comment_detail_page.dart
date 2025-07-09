import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../widgets/thread_view.dart';
import '../../providers/auth_provider.dart';
import '../../models/comment_model.dart';
import 'widget/create_reply_modal.dart';
import 'package:provider/provider.dart';

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
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    context.read<CommentBloc>().add(LoadCommentDetail(widget.commentId, userId: authProvider.userId));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CommentBloc, CommentState>(
      listener: (context, state) {
        if (state is CommentError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red,
            ),
          );
        } else if (state is CommentDeleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Commentaire supprimé'),
              backgroundColor: Colors.green,
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: Colors.grey.shade50,
        appBar: AppBar(
          title: const Text(
            '🧵 Thread de discussion',
            style: TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.bold,
            ),
          ),
          backgroundColor: Colors.white,
          elevation: 0,
          iconTheme: const IconThemeData(color: Colors.black87),
        ),
        body: RefreshIndicator(
          onRefresh: () async {
            final authProvider = Provider.of<AuthProvider>(context, listen: false);
            context.read<CommentBloc>().add(LoadCommentDetail(widget.commentId, userId: authProvider.userId));
          },
          child: BlocBuilder<CommentBloc, CommentState>(
            builder: (context, state) {
              if (state is CommentLoading) {
                return const Center(
                  child: CircularProgressIndicator(),
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
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Erreur de chargement',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        state.message,
                        style: TextStyle(
                          color: Colors.grey.shade500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          final authProvider = Provider.of<AuthProvider>(context, listen: false);
                          context.read<CommentBloc>().add(LoadCommentDetail(widget.commentId, userId: authProvider.userId));
                        },
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                );
              }

              if (state is CommentThreadLoaded) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Thread hiérarchique
                      ThreadView(
                        threadHierarchy: state.threadHierarchy,
                        onLike: _handleLike,
                        onReply: _handleReply,
                      ),
                    ],
                  ),
                );
              }

              return const Center(
                child: Text('Aucune donnée'),
              );
            },
          ),
        ),
      ),
    );
  }





  void _handleLike(Comment comment) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.currentUser?.idPerson?.toString();
    
    if (userId != null) {
      context.read<CommentBloc>().add(
        LikeComment(comment.idComment, userId),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vous devez être connecté pour liker'),
        ),
      );
    }
  }

  void _handleReply(Comment comment) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => CreateReplyModal(parentComment: comment),
    );
  }
} 