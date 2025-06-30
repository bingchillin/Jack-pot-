import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../../bloc/comment/comment_event.dart';
import '../../bloc/comment/comment_state.dart';
import '../../models/comment_model.dart';
import '../../providers/auth_provider.dart';
import '../../services/comment_service.dart';
import 'widget/comment_card.dart';
import 'widget/create_post_modal.dart';

class AdvisePage extends StatefulWidget {
  const AdvisePage({super.key});

  @override
  State<AdvisePage> createState() => _AdvisePageState();
}

class _AdvisePageState extends State<AdvisePage> {
  late CommentBloc _commentBloc;
  final Map<int, bool> _expandedReplies = {};

  @override
  void initState() {
    super.initState();
    final authProvider = context.read<AuthProvider>();
    final token = authProvider.accessToken; // Peut être null
    
    _commentBloc = CommentBloc(
      commentService: CommentService(),
      token: token,
    );
    
    // Charger les commentaires au démarrage (même sans authentification)
    _commentBloc.add(const LoadComments());
  }

  @override
  void dispose() {
    _commentBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        // Mettre à jour le token si l'état d'authentification change
        if (authProvider.isAuthenticated && authProvider.accessToken != null) {
          // Recharger les commentaires si l'utilisateur vient de se connecter
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (_commentBloc.state is! CommentLoading) {
              _commentBloc.add(const LoadComments());
            }
          });
        }

        return BlocProvider.value(
          value: _commentBloc,
          child: BlocListener<CommentBloc, CommentState>(
            listener: (context, state) {
              if (state is CommentError) {
                // Gérer les erreurs d'authentification spécifiquement
                if (state.message.contains('Authentification requise')) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.message),
                      backgroundColor: Colors.orange,
                      action: SnackBarAction(
                        label: 'Se connecter',
                        textColor: Colors.white,
                        onPressed: () {
                          // TODO: Navigation vers la page de connexion
                        },
                      ),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.message),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: Scaffold(
              backgroundColor: Colors.grey.shade50,
              body: RefreshIndicator(
                onRefresh: () async {
                  _commentBloc.add(const LoadComments());
                  // Attendre que le chargement soit terminé
                  await Future.delayed(const Duration(milliseconds: 500));
                },
                child: CustomScrollView(
                  slivers: [
                    // App Bar avec titre et bouton de création
                    SliverAppBar(
                      floating: true,
                      pinned: true,
                      backgroundColor: Colors.white,
                      elevation: 0,
                      title: const Text(
                        '💬 Forum Communautaire',
                        style: TextStyle(
                          color: Colors.black87,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      actions: [
                        IconButton(
                          onPressed: () => _showCreatePostModal(context),
                          icon: Icon(
                            authProvider.isAuthenticated 
                                ? Icons.add_circle_outline 
                                : Icons.lock_outline,
                            color: authProvider.isAuthenticated 
                                ? Colors.blue 
                                : Colors.grey,
                            size: 28,
                          ),
                          tooltip: authProvider.isAuthenticated 
                              ? 'Nouveau post' 
                              : 'Connectez-vous pour créer un post',
                        ),
                      ],
                    ),
                    // Zone de création de post
                    SliverToBoxAdapter(
                      child: Consumer<AuthProvider>(
                        builder: (context, authProvider, child) {
                          return Container(
                            margin: const EdgeInsets.all(16),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.1),
                                  spreadRadius: 1,
                                  blurRadius: 3,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                            child: GestureDetector(
                              onTap: () => _showCreatePostModal(context),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 20,
                                    backgroundColor: authProvider.isAuthenticated 
                                        ? Colors.blue.shade100 
                                        : Colors.grey.shade300,
                                    child: Icon(
                                      authProvider.isAuthenticated 
                                          ? Icons.person 
                                          : Icons.lock,
                                      color: authProvider.isAuthenticated 
                                          ? Colors.blue.shade700 
                                          : Colors.grey.shade600,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      authProvider.isAuthenticated 
                                          ? 'Partagez votre expérience...'
                                          : 'Connectez-vous pour partager...',
                                      style: TextStyle(
                                        color: authProvider.isAuthenticated 
                                            ? Colors.grey.shade600 
                                            : Colors.grey.shade500,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    authProvider.isAuthenticated 
                                        ? Icons.edit_outlined 
                                        : Icons.login,
                                    color: authProvider.isAuthenticated 
                                        ? Colors.grey.shade600 
                                        : Colors.grey.shade500,
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
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
                                      _commentBloc.add(const LoadComments());
                                    },
                                    child: const Text('Réessayer'),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }

                        if (state is CommentLoaded) {
                          if (state.comments.isEmpty) {
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
                                final comment = state.comments[index];
                                final replies = state.replies[comment.idComment] ?? [];
                                final showReplies = _expandedReplies[comment.idComment] ?? false;

                                return CommentCard(
                                  comment: comment,
                                  replies: replies,
                                  showReplies: showReplies,
                                );
                              },
                              childCount: state.comments.length,
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
              // Bouton flottant pour créer un post
              floatingActionButton: Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  if (!authProvider.isAuthenticated) {
                    return FloatingActionButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Connectez-vous pour créer un post'),
                            backgroundColor: Colors.orange,
                          ),
                        );
                      },
                      backgroundColor: Colors.grey,
                      child: const Icon(
                        Icons.lock,
                        color: Colors.white,
                      ),
                    );
                  }
                  
                  return FloatingActionButton(
                    onPressed: () => _showCreatePostModal(context),
                    backgroundColor: Colors.blue,
                    child: const Icon(
                      Icons.add,
                      color: Colors.white,
                    ),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }

  void _showCreatePostModal(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Connectez-vous pour créer un post'),
          backgroundColor: Colors.orange,
          action: SnackBarAction(
            label: 'Se connecter',
            textColor: Colors.white,
            onPressed: (){
              Navigator.pushNamed(context, '/login');
            }, // TODO: Ajouter navigation vers login
          ),
        ),
      );
      return;
    }
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const CreatePostModal(),
    );
  }

  void _toggleReplies(int commentId) {
    setState(() {
      _expandedReplies[commentId] = !(_expandedReplies[commentId] ?? false);
    });
  }
}
