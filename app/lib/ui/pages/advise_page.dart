import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_list_bloc.dart';
import 'widget/comment_card.dart';
import 'widget/create_post_modal.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class AdvisePage extends StatefulWidget {
  const AdvisePage({super.key});

  @override
  State<AdvisePage> createState() => _AdvisePageState();
}

class _AdvisePageState extends State<AdvisePage> {
  @override
  void initState() {
    super.initState();
    // Charger les commentaires au démarrage
    context.read<CommentListBloc>().add(LoadComments());
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CommentListBloc, CommentListState>(
      listener: (context, state) {
        if (state is CommentListError) {
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
        body: RefreshIndicator(
          onRefresh: () async {
            context.read<CommentListBloc>().add(RefreshComments());
            await Future.delayed(const Duration(milliseconds: 500));
          },
          child: CustomScrollView(
            slivers: [
              // App Bar avec titre
              SliverAppBar(
                floating: true,
                pinned: true,
                backgroundColor: Colors.white,
                elevation: 0,
                title: const Text(
                  '💬 Forum Communautaire',
                  style: TextStyle(
                    fontFamily: '04B_30__',
                    fontSize: 20,
                    color: Colors.black87,
                  ),
                ),
              ),
              // Liste des commentaires
              BlocBuilder<CommentListBloc, CommentListState>(
                builder: (context, state) {
                  if (state is CommentListLoading) {
                    return const SliverFillRemaining(
                      child: Center(
                        child: CircularProgressIndicator(),
                      ),
                    );
                  }

                  if (state is CommentListError) {
                    return SliverFillRemaining(
                      child: Center(
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
                                context.read<CommentListBloc>().add(LoadComments());
                              },
                              child: const Text('Réessayer'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  if (state is CommentListLoaded) {
                    // Debug : affiche les ids et parentCommentId
                    for (final comment in state.comments) {
                      print('Comment id: [33m[1m[4m${comment.idComment}[0m, parentCommentId: [36m${comment.parentCommentId}[0m');
                    }

                    // Filtre temporaire : n'affiche que les parents
                    final parentComments = state.comments.where((c) => c.parentCommentId == null).toList();

                    if (parentComments.isEmpty) {
                      return SliverFillRemaining(
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.chat_bubble_outline,
                                size: 64,
                                color: Colors.grey.shade400,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Aucun post pour le moment',
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Soyez le premier à partager !',
                                style: TextStyle(
                                  color: Colors.grey.shade500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    return SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final comment = parentComments[index];
                          return CommentCard(
                            comment: comment,
                            replies: [],
                            showReplies: false,
                          );
                        },
                        childCount: parentComments.length,
                      ),
                    );
                  }

                  return const SliverFillRemaining(
                    child: Center(
                      child: Text('Aucune donnée'),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        floatingActionButton: Builder(
          builder: (context) {
            final isAuthenticated = Provider.of<AuthProvider>(context, listen: false).isAuthenticated;
            if (!isAuthenticated) return const SizedBox.shrink();
            return FloatingActionButton(
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  builder: (context) => const CreatePostModal(),
                );
              },
              backgroundColor: Colors.blue,
              child: const Icon(Icons.add_comment_rounded, color: Colors.white),
              tooltip: 'Nouveau post',
            );
          },
        ),
      ),
    );
  }
}
