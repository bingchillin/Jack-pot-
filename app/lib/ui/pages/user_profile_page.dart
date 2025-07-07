import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/user_profile_model.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import '../../providers/auth_provider.dart';
import 'widget/comment_card.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/user_profile_comments_bloc.dart';
import 'package:flutter/scheduler.dart';

class UserProfilePage extends StatefulWidget {
  final int userId;
  const UserProfilePage({super.key, required this.userId});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> with RouteAware {
  late Future<UserProfile> _profileFuture;
  late Future<List<Comment>> _postsFuture;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.userId;
    _profileFuture = CommentService().fetchUserProfile(widget.userId, token);
    _postsFuture = CommentService().fetchUserMainComments(widget.userId, token, currentUserId: currentUserId);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // S'abonner à la navigation pour détecter le retour
    final route = ModalRoute.of(context);
    if (route is PageRoute) {
      RouteObserver<PageRoute> routeObserver = RouteObserver<PageRoute>();
      routeObserver.subscribe(this, route);
    }
  }

  @override
  void dispose() {
    // Se désabonner
    final route = ModalRoute.of(context);
    if (route is PageRoute) {
      RouteObserver<PageRoute> routeObserver = RouteObserver<PageRoute>();
      routeObserver.unsubscribe(this);
    }
    super.dispose();
  }

  @override
  void didPopNext() {
    // Rafraîchir les commentaires quand on revient de la page détail
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUserId = authProvider.userId;
    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<UserProfileCommentsBloc>().add(RefreshUserProfileComments(widget.userId, currentUserId: currentUserId));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.userId;
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Profil utilisateur', style: TextStyle(color: Colors.black87)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: FutureBuilder<UserProfile>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Erreur: \\${snapshot.error}'));
          }
          final profile = snapshot.data!;
          return Column(
            children: [
              // Header profil façon Twitter
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Colors.blue.shade300,
                      child: Text(
                        profile.firstname.isNotEmpty ? profile.firstname[0].toUpperCase() : 'U',
                        style: const TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '${profile.firstname} ${profile.surname}',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      profile.email,
                      style: const TextStyle(fontSize: 16, color: Colors.black54),
                    ),
                    if (profile.createdAt != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          'Inscrit le \\${profile.createdAt!.day}/\\${profile.createdAt!.month}/\\${profile.createdAt!.year}',
                          style: const TextStyle(fontSize: 14, color: Colors.black45),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: BlocProvider(
                  create: (_) => UserProfileCommentsBloc(
                    commentService: CommentService(),
                    token: token,
                  )..add(LoadUserProfileComments(widget.userId, currentUserId: currentUserId)),
                  child: BlocBuilder<UserProfileCommentsBloc, UserProfileCommentsState>(
                    builder: (context, state) {
                      if (state is UserProfileCommentsLoading) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (state is UserProfileCommentsError) {
                        return Center(child: Text('Erreur: \\${state.message}'));
                      }
                      if (state is UserProfileCommentsLoaded) {
                        final posts = state.comments;
                        if (posts.isEmpty) {
                          return const Center(child: Text('Aucun post pour cet utilisateur.'));
                        }
                        return RefreshIndicator(
                          onRefresh: () async {
                            context.read<UserProfileCommentsBloc>().add(RefreshUserProfileComments(widget.userId, currentUserId: currentUserId));
                            await Future.delayed(const Duration(milliseconds: 500));
                          },
                          child: ListView.builder(
                            padding: const EdgeInsets.only(top: 8),
                            itemCount: posts.length,
                            itemBuilder: (context, index) {
                              return CommentCard(comment: posts[index]);
                            },
                          ),
                        );
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
} 