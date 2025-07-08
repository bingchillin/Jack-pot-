import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../../models/comment_model.dart';
import 'widget/comment_card.dart';
import 'widget/create_post_modal.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class AdvisePage extends StatefulWidget {
  const AdvisePage({super.key});

  @override
  State<AdvisePage> createState() => _AdvisePageState();
}

class _AdvisePageState extends State<AdvisePage> with RouteAware {
  @override
  void initState() {
    super.initState();
    // Charger les commentaires au démarrage si pas déjà chargés
    final currentState = context.read<CommentBloc>().state;
    if (currentState is CommentInitial) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      context.read<CommentBloc>().add(LoadMainComments(userId: authProvider.userId));
    }
  }
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Détecter quand on revient à cette page
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final currentState = context.read<CommentBloc>().state;
      if (currentState is CommentThreadLoaded) {
        // On revient d'une page détail, forcer l'affichage de la liste principale
        context.read<CommentBloc>().add(const EmitMainCommentsState());
      }
    });
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
        }
      },
      child: Scaffold(
        backgroundColor: Colors.grey.shade50,
        body: RefreshIndicator(
          onRefresh: () async {
            final authProvider = Provider.of<AuthProvider>(context, listen: false);
            context.read<CommentBloc>().add(LoadMainComments(userId: authProvider.userId));
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
              BlocBuilder<CommentBloc, CommentState>(
                builder: (context, state) {
                  if (state is CommentLoading) {
                    return const SliverFillRemaining(
                      child: Center(
                        child: CircularProgressIndicator(),
                      ),
                    );
                  }

                  if (state is CommentError) {
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
                                final authProvider = Provider.of<AuthProvider>(context, listen: false);
                                context.read<CommentBloc>().add(LoadMainComments(userId: authProvider.userId));
                              },
                              child: const Text('Réessayer'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Afficher les commentaires pour les états CommentMainLoaded ET CommentDetailLoaded
                  List<Comment> commentsToShow = [];
                  if (state is CommentMainLoaded) {
                    commentsToShow = state.comments;
                  } else if (state is CommentThreadLoaded) {
                    // Si on est en état détail, on affiche quand même la liste principale depuis le cache
                    final bloc = context.read<CommentBloc>();
                    commentsToShow = bloc.mainComments;
                  }

                  if (commentsToShow.isEmpty) {
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
                        final comment = commentsToShow[index];
                        return CommentCard(
                          comment: comment,
                          showReplies: false,
                        );
                      },
                      childCount: commentsToShow.length,
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
