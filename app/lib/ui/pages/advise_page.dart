import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../../models/comment_model.dart';
import 'widget/comment_card.dart';
import 'widget/create_post_modal.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../widgets/feed_toggle_header.dart';
import '../widgets/tag_filter_widget.dart';
import '../../main.dart';
import '../../l10n/app_localizations.dart';

class AdvisePage extends StatefulWidget {
  const AdvisePage({super.key});

  @override
  State<AdvisePage> createState() => _AdvisePageState();
}

class _AdvisePageState extends State<AdvisePage> with RouteAware {
  FeedType _currentFeed = FeedType.forYou;
  TagFilter _selectedTagFilter = TagFilter.all;

  @override
  void initState() {
    super.initState();
    // Charger les commentaires au démarrage si pas déjà chargés
    final currentState = context.read<CommentBloc>().state;
    if (currentState is CommentInitial) {
      _loadCurrentFeed();
    }
  }
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // S'abonner au RouteObserver
    final route = ModalRoute.of(context);
    if (route is PageRoute) {
      routeObserver.subscribe(this, route);
    }
    
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
  void dispose() {
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  // Méthode appelée quand la page devient visible (retour depuis une autre page)
  @override
  void didPopNext() {
    super.didPopNext();
    // Rafraîchir les commentaires quand on revient sur cette page
    // (utile après des changements comme déblocage d'utilisateurs)
    print('🔄 Advise page: Returning from another page, refreshing feed');
    _loadCurrentFeed();
  }

  void _loadCurrentFeed() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.userId;
    
    if (_currentFeed == FeedType.forYou) {
      context.read<CommentBloc>().add(LoadMainComments(userId: userId));
    } else {
      // Pour les amis, on a besoin d'être connecté
      if (authProvider.isAuthenticated && authProvider.currentUser?.idPerson != null) {
        context.read<CommentBloc>().add(LoadFriendsComments(authProvider.currentUser!.idPerson));
      } else {
        // Si pas connecté, revenir au feed "Pour toi"
        setState(() {
          _currentFeed = FeedType.forYou;
        });
        context.read<CommentBloc>().add(LoadMainComments(userId: userId));
      }
    }
  }

  void _onFeedChanged(FeedType newFeed) {
    if (newFeed == _currentFeed) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
    // Vérifier l'authentification pour le feed des amis
    if (newFeed == FeedType.friends && !authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(localizations.loginToSeeFriends),
          action: SnackBarAction(
            label: localizations.signIn,
            onPressed: () => Navigator.pushNamed(context, '/login'),
          ),
        ),
      );
      return;
    }
    
    setState(() {
      _currentFeed = newFeed;
    });
    
    _loadCurrentFeed();
  }

  void _onTagFilterChanged(TagFilter newFilter) {
    setState(() {
      _selectedTagFilter = newFilter;
    });
  }

  List<Comment> _filterCommentsByTag(List<Comment> comments) {
    if (_selectedTagFilter == TagFilter.all) {
      return comments;
    }
    
    return comments.where((comment) {
      // Filtrer par tag
      final tagValue = _selectedTagFilter.tagValue;
      return comment.tag == tagValue;
    }).toList();
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
              backgroundColor: Colors.red,
            ),
          );
        } else if (state is CommentDeleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(localizations.commentDeleted),
              backgroundColor: Colors.green,
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: Colors.grey.shade50,
        body: RefreshIndicator(
          onRefresh: () async {
            _loadCurrentFeed();
          },
          child: CustomScrollView(
            slivers: [
              // Header avec titre et description
              SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green[50],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.forum,
                              color: Colors.green[600],
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  localizations.commentsTitle,
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.grey[800],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  localizations.commentsSubtitle,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              // Header avec toggle Pour toi / Amis
              SliverToBoxAdapter(
                child: FeedToggleHeader(
                  currentFeed: _currentFeed,
                  onFeedChanged: _onFeedChanged,
                  hasUnreadFriends: false, // TODO: implémenter la logique de notifications
                ),
              ),
              // Filtre par tags
              SliverToBoxAdapter(
                child: TagFilterWidget(
                  selectedFilter: _selectedTagFilter,
                  onFilterChanged: _onTagFilterChanged,
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
                              localizations.loadingError,
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
                                _loadCurrentFeed();
                              },
                              child: Text(localizations.retry),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Afficher les commentaires pour les états CommentMainLoaded, CommentDetailLoaded et CommentLikeUpdated
                  List<Comment> commentsToShow = [];
                  if (state is CommentMainLoaded) {
                    commentsToShow = state.comments;
                  } else if (state is CommentThreadLoaded) {
                    // Si on est en état détail, on affiche quand même la liste principale depuis le cache
                    final bloc = context.read<CommentBloc>();
                    commentsToShow = bloc.mainComments;
                  } else if (state is CommentLikeUpdated) {
                    // Si c'est une mise à jour de like, afficher la liste principale depuis le cache
                    final bloc = context.read<CommentBloc>();
                    commentsToShow = bloc.mainComments;
                  }

                  // Appliquer le filtre par tag
                  commentsToShow = _filterCommentsByTag(commentsToShow);

                  if (commentsToShow.isEmpty) {
                    return SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _selectedTagFilter != TagFilter.all 
                                  ? Icons.filter_list_off
                                  : (_currentFeed == FeedType.friends ? Icons.people_outline : Icons.chat_bubble_outline),
                              size: 64,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _selectedTagFilter != TagFilter.all
                                  ? localizations.noPostsFilter(_selectedTagFilter.getDisplayName(context))
                                  : (_currentFeed == FeedType.friends 
                                      ? localizations.noPostsFriends
                                      : localizations.noPostsYet),
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _selectedTagFilter != TagFilter.all
                                  ? localizations.tryDifferentFilter
                                  : (_currentFeed == FeedType.friends 
                                      ? localizations.friendsNotPosted
                                      : localizations.beFirstToShare),
                              style: TextStyle(
                                color: Colors.grey.shade500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            if (_selectedTagFilter != TagFilter.all) ...[
                              const SizedBox(height: 16),
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    _selectedTagFilter = TagFilter.all;
                                  });
                                },
                                child: Text(localizations.showAllPosts),
                              ),
                            ] else if (_currentFeed == FeedType.friends) ...[
                              const SizedBox(height: 16),
                              TextButton(
                                onPressed: () {
                                  Navigator.pushNamed(context, '/friends-management');
                                },
                                child: Text(localizations.manageFriends),
                              ),
                            ],
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
              backgroundColor: Colors.green[600],
              child: const Icon(Icons.add_comment_rounded, color: Colors.white),
              tooltip: localizations.newPost,
            );
          },
        ),
      ),
    );
  }
}
