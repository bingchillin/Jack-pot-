import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../../models/comment_model.dart';
import 'widget/comment_card.dart';
import 'widget/create_post_modal_redesigned.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../widgets/twitter_feed_toggle.dart';
import '../widgets/twitter_tag_filter.dart';
import '../widgets/comment_card_shimmer.dart';
import '../../main.dart';
import '../../l10n/app_localizations.dart';

class AdvisePage extends StatefulWidget {
  const AdvisePage({super.key});

  @override
  State<AdvisePage> createState() => _AdvisePageState();
}

class _AdvisePageState extends State<AdvisePage> 
    with RouteAware, TickerProviderStateMixin {
  FeedType _currentFeed = FeedType.forYou;
  TagFilter _selectedTagFilter = TagFilter.all;
  
  // Scroll controller for the feed list
  final ScrollController _scrollController = ScrollController();
  
  // Track if this is initial loading (show shimmer) vs tab switching (show cached data)
  bool _isInitialLoading = true;

  @override
  void initState() {
    super.initState();
    
    // No custom scroll listener needed
    
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
    _scrollController.dispose();
    routeObserver.unsubscribe(this);
    super.dispose();
  }
  
  // No custom _onScroll needed as SliverAppBar handles show/hide

  // Méthode appelée quand la page devient visible (retour depuis une autre page)
  @override
  void didPopNext() {
    super.didPopNext();
    // Vérifier si on a du cache, sinon recharger
    final bloc = context.read<CommentBloc>();
    final hasCache = _currentFeed == FeedType.friends 
        ? bloc.friendsComments.isNotEmpty 
        : bloc.mainComments.isNotEmpty;
    
    if (!hasCache) {
      print('🔄 Advise page: No cache available, loading fresh data');
      _loadCurrentFeed();
    } else {
      print('🔄 Advise page: Using cached data, no reload needed');
      // Émettre l'état principal pour afficher le cache
      context.read<CommentBloc>().add(const EmitMainCommentsState());
    }
  }

  void _loadCurrentFeed() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.userId;
    final requestId = DateTime.now().millisecondsSinceEpoch.toString();
    
    if (_currentFeed == FeedType.forYou) {
      context.read<CommentBloc>().add(LoadMainComments(userId: userId, requestId: requestId));
    } else {
      // Pour les amis, on a besoin d'être connecté
      if (authProvider.isAuthenticated && authProvider.currentUser?.idPerson != null) {
        context.read<CommentBloc>().add(LoadFriendsComments(authProvider.currentUser!.idPerson, requestId: requestId));
      } else {
        // Si pas connecté, revenir au feed "Pour toi"
        setState(() {
          _currentFeed = FeedType.forYou;
        });
        context.read<CommentBloc>().add(LoadMainComments(userId: userId, requestId: requestId));
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
          backgroundColor: Colors.grey[800],
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          action: SnackBarAction(
            label: localizations.signIn,
            textColor: Colors.green[400],
            onPressed: () => Navigator.pushNamed(context, '/login'),
          ),
        ),
      );
      return;
    }
    
    setState(() {
      _currentFeed = newFeed;
      _isInitialLoading = false; // No longer initial loading when switching tabs
    });
    
    // Set the current feed type in the bloc BEFORE loading
    context.read<CommentBloc>().add(SetCurrentFeedType(newFeed));
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
              backgroundColor: Colors.red[600],
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          );
        } else if (state is CommentDeleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(localizations.commentDeleted),
              backgroundColor: Colors.green[600],
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          );
        } else if (state is CommentCreated) {
          // No need to refresh - BLoC should handle cache updates automatically
          // The CommentMainLoaded state will be emitted by the BLoC after CreateComment
        }
      },
      child: Scaffold(
        backgroundColor: Colors.green[50],
        body: RefreshIndicator(
          onRefresh: () async {
            _loadCurrentFeed();
          },
          color: Colors.green[600],
          child: CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Sticky Twitter-like header with feed toggle + tag filter
              SliverAppBar(
                backgroundColor: Colors.green[50],
                floating: true, // Show when scrolling up
                snap: true,     // Snap into view quickly
                toolbarHeight: 0,
                elevation: 0,
                automaticallyImplyLeading: false,
                stretch: true,
                expandedHeight: 0,
                collapsedHeight: 0,
                primary: true,
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(116),
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TwitterFeedToggle(
                        currentFeed: _currentFeed,
                        onFeedChanged: _onFeedChanged,
                        hasUnreadFriends: false,
                      ),
                      TwitterTagFilter(
                        selectedFilter: _selectedTagFilter,
                        onFilterChanged: _onTagFilterChanged,
                      ),
                    ],
                  ),
                ),
              ),
              
              // Comments list
              BlocBuilder<CommentBloc, CommentState>(
                builder: (context, state) {
                  if (state is CommentLoading && _isInitialLoading) {
                    return SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => const CommentCardShimmer(),
                        childCount: 6, // Show 6 shimmer cards
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
                            ElevatedButton(
                              onPressed: () => _loadCurrentFeed(),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green[600],
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              child: Text(localizations.retry),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Afficher les commentaires pour les états CommentMainLoaded, CommentDetailLoaded et CommentLikeUpdated
                  List<Comment> commentsToShow = [];
                  final bloc = context.read<CommentBloc>();
                  
                  if (state is CommentMainLoaded) {
                    commentsToShow = state.comments;
                  } else if (state is CommentThreadLoaded) {
                    // Si on est en état détail, on affiche quand même la liste principale depuis le cache
                    commentsToShow = _currentFeed == FeedType.friends ? bloc.friendsComments : bloc.mainComments;
                    // Si le cache est vide, forcer un rechargement immédiat
                    if (commentsToShow.isEmpty) {
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        _loadCurrentFeed();
                      });
                    }
                  } else if (state is CommentLikeUpdated) {
                    // Si c'est une mise à jour de like, afficher la liste appropriée depuis le cache
                    commentsToShow = _currentFeed == FeedType.friends ? bloc.friendsComments : bloc.mainComments;
                  } else if (state is CommentLoading && !_isInitialLoading) {
                    // Pendant le chargement (non-initial), afficher le cache approprié si disponible
                    commentsToShow = _currentFeed == FeedType.friends ? bloc.friendsComments : bloc.mainComments;
                  }

                  // Appliquer le filtre par tag
                  commentsToShow = _filterCommentsByTag(commentsToShow);

                  if (commentsToShow.isEmpty) {
                    // Si on est en état de chargement et qu'on n'a pas de cache, afficher le shimmer
                    if (state is CommentLoading) {
                      return SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) => const CommentCardShimmer(),
                          childCount: 6, // Show 6 shimmer cards
                        ),
                      );
                    }
                    
                    return SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                _selectedTagFilter != TagFilter.all 
                                    ? Icons.filter_list_off
                                    : (_currentFeed == FeedType.friends ? Icons.people_outline : Icons.chat_bubble_outline),
                                size: 48,
                                color: Colors.grey[400],
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              _selectedTagFilter != TagFilter.all
                                  ? localizations.noPostsFilter(_selectedTagFilter.getDisplayName(context))
                                  : (_currentFeed == FeedType.friends 
                                      ? localizations.noPostsFriends
                                      : localizations.noPostsYet),
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey[800],
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _selectedTagFilter != TagFilter.all
                                  ? localizations.tryDifferentFilter
                                  : (_currentFeed == FeedType.friends 
                                      ? localizations.friendsNotPosted
                                      : localizations.beFirstToPost),
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            if (_selectedTagFilter != TagFilter.all) ...[
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    _selectedTagFilter = TagFilter.all;
                                  });
                                },
                                style: TextButton.styleFrom(
                                  foregroundColor: Colors.green[600],
                                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                ),
                                child: Text(localizations.showAllPosts),
                              ),
                            ] else if (_currentFeed == FeedType.friends) ...[
                              TextButton(
                                onPressed: () {
                                  Navigator.pushNamed(context, '/friends-management');
                                },
                                style: TextButton.styleFrom(
                                  foregroundColor: Colors.green[600],
                                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                ),
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
                        // Add a subtle loading indicator at the top when refreshing with cached data
                        if (index == 0 && state is CommentLoading && commentsToShow.isNotEmpty) {
                          return Column(
                            children: [
                              SizedBox(
                                height: 3,
                                child: LinearProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.green[600]!),
                                  backgroundColor: Colors.green[100],
                                ),
                              ),
                              CommentCard(
                                comment: commentsToShow[index],
                                showReplies: false,
                              ),
                            ],
                          );
                        }
                        
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
                  backgroundColor: Colors.transparent,
                  builder: (context) => const CreatePostModalRedesigned(),
                );
              },
              backgroundColor: Colors.green[600],
              elevation: 8,
              child: const Icon(Icons.add, color: Colors.white, size: 28),
            );
          },
        ),
      ),
    );
  }
}
