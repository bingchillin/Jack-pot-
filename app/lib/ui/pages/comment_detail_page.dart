import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_detail_bloc.dart';
import 'widget/comment_card.dart';
import '../../providers/auth_provider.dart';
import '../../models/comment_model.dart';
import 'widget/create_reply_modal.dart';
import '../../bloc/comment/comment_list_bloc.dart';
import 'package:provider/provider.dart';
import '../../services/comment_service.dart';
import '../../bloc/comment/comment_item_bloc.dart';
import '../../bloc/comment/comment_replies_bloc.dart';
import '../../bloc/comment/comment_replies_event.dart';

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
    // Le Bloc est déjà initialisé avec les bonnes données via le BlocProvider
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        final state = context.read<CommentDetailBloc>().state;
        if (state is CommentDetailLoaded && state.parentComment.parentCommentId != null) {
          // On est sur une page de détail d'une réponse
          context.read<CommentRepliesBloc>().add(RefreshReplies(state.parentComment.parentCommentId!));
        }
        return true;
      },
      child: BlocListener<CommentDetailBloc, CommentDetailState>(
        listener: (context, state) {
          if (state is CommentDetailError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        child: Scaffold(
          backgroundColor: Colors.grey.shade50,
          appBar: AppBar(
            title: const Text(
              '💬 Détail du commentaire',
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
              context.read<CommentDetailBloc>().add(RefreshCommentDetail(widget.commentId));
              await Future.delayed(const Duration(milliseconds: 500));
            },
            child: BlocBuilder<CommentDetailBloc, CommentDetailState>(
              builder: (context, state) {
                if (state is CommentDetailLoading) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }

                if (state is CommentDetailError) {
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
                            context.read<CommentDetailBloc>().add(LoadCommentDetail(widget.commentId));
                          },
                          child: const Text('Réessayer'),
                        ),
                      ],
                    ),
                  );
                }

                if (state is CommentDetailLoaded) {
                  // Trie les réponses : celles de l'auteur du post principal en premier
                  final parentAuthorId = state.parentComment.idPerson.toString();
                  List<Comment> sortedReplies = List.from(state.replies);
                  sortedReplies.sort((a, b) {
                    final aIsAuthor = a.idPerson.toString() == parentAuthorId;
                    final bIsAuthor = b.idPerson.toString() == parentAuthorId;
                    if (aIsAuthor && !bIsAuthor) return -1;
                    if (!aIsAuthor && bIsAuthor) return 1;
                    return 0;
                  });

                  return CustomScrollView(
                    slivers: [
                      // Commentaire parent
                      SliverToBoxAdapter(
                        child: Builder(
                          builder: (context) {
                            final token = Provider.of<AuthProvider>(context, listen: false).accessToken;
                            final userId = Provider.of<AuthProvider>(context, listen: false).userId;
                            return BlocProvider(
                              create: (_) => CommentItemBloc(
                                commentService: CommentService(),
                                token: token,
                                userId: userId,
                                comment: state.parentComment,
                              ),
                              child: GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => BlocProvider(
                                        create: (_) => CommentDetailBloc(
                                          commentService: CommentService(),
                                          token: token,
                                          navigatorKey: GlobalKey<NavigatorState>(),
                                        )..add(LoadCommentDetail(state.parentComment.idComment)),
                                        child: CommentDetailPage(commentId: state.parentComment.idComment),
                                      ),
                                    ),
                                  );
                                },
                                child: CommentCard(
                                  comment: state.parentComment,
                                  replies: [],
                                  showReplies: false,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      // Séparateur
                      SliverToBoxAdapter(
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          child: Row(
                            children: [
                              Expanded(child: Divider(color: Colors.grey.shade300)),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  '${sortedReplies.length} réponses',
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              Expanded(child: Divider(color: Colors.grey.shade300)),
                            ],
                          ),
                        ),
                      ),
                      // Liste des réponses
                      if (sortedReplies.isEmpty)
                        SliverFillRemaining(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.chat_bubble_outline,
                                  size: 48,
                                  color: Colors.grey.shade400,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Aucune réponse pour le moment',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Soyez le premier à répondre !',
                                  style: TextStyle(
                                    color: Colors.grey.shade500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final reply = sortedReplies[index];
                              final token = Provider.of<AuthProvider>(context, listen: false).accessToken;
                              final userId = Provider.of<AuthProvider>(context, listen: false).userId;
                              return Container(
                                margin: const EdgeInsets.only(left: 32),
                                child: BlocProvider(
                                  create: (_) => CommentItemBloc(
                                    commentService: CommentService(),
                                    token: token,
                                    userId: userId,
                                    comment: reply,
                                  ),
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => BlocProvider(
                                            create: (_) => CommentDetailBloc(
                                              commentService: CommentService(),
                                              token: token,
                                              navigatorKey: GlobalKey<NavigatorState>(),
                                            )..add(LoadCommentDetail(reply.idComment)),
                                            child: CommentDetailPage(commentId: reply.idComment),
                                          ),
                                        ),
                                      );
                                    },
                                    child: CommentCard(
                                      comment: reply,
                                      replies: [],
                                      showReplies: false,
                                    ),
                                  ),
                                ),
                              );
                            },
                            childCount: sortedReplies.length,
                          ),
                        ),
                    ],
                  );
                }

                return const Center(
                  child: Text('Aucune donnée'),
                );
              },
            ),
          ),
          floatingActionButton: BlocBuilder<CommentDetailBloc, CommentDetailState>(
            builder: (context, state) {
              if (state is CommentDetailLoaded) {
                return FloatingActionButton.extended(
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                      ),
                      builder: (context) => CreateReplyModal(parentComment: state.parentComment),
                    );
                  },
                  backgroundColor: Colors.blue,
                  icon: const Icon(Icons.reply, color: Colors.white),
                  label: const Text('Répondre', style: TextStyle(color: Colors.white)),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  }
} 