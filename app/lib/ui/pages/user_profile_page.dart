import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/user_profile_model.dart';
import '../../services/comment_service.dart';
import '../../providers/auth_provider.dart';
import 'widget/comment_card.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../widgets/friend_request_button.dart';

class UserProfilePage extends StatefulWidget {
  final int userId;
  const UserProfilePage({super.key, required this.userId});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> with RouteAware {
  late Future<UserProfile> _profileFuture;
  late CommentBloc _commentBloc;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.userId;
    
    _profileFuture = CommentService().fetchUserProfile(widget.userId, token);
    
    // Créer un bloc dédié pour ce profil utilisateur
    _commentBloc = CommentBloc(
      commentService: CommentService(),
      token: token,
    );
    
    // Charger les commentaires de l'utilisateur
    _commentBloc.add(LoadMainComments(userId: currentUserId));
  }

  @override
  void dispose() {
    _commentBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
            return Center(child: Text('Erreur: ${snapshot.error}'));
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
                          'Inscrit le ${profile.createdAt!.day}/${profile.createdAt!.month}/${profile.createdAt!.year}',
                          style: const TextStyle(fontSize: 14, color: Colors.black45),
                        ),
                      ),
                    const SizedBox(height: 16),
                    // Bouton d'ajout d'ami
                    FriendRequestButton(
                      targetUserId: widget.userId,
                      onStatusChanged: () {
                        // Optionnel : rafraîchir quelque chose si nécessaire
                        print('Statut d\'ami changé pour l\'utilisateur ${widget.userId}');
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: BlocProvider.value(
                  value: _commentBloc,
                  child: BlocBuilder<CommentBloc, CommentState>(
                    builder: (context, state) {
                      if (state is CommentLoading) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (state is CommentError) {
                        return Center(child: Text('Erreur: ${state.message}'));
                      }
                      if (state is CommentMainLoaded) {
                        // Filtrer les commentaires de cet utilisateur
                        final userComments = state.comments.where((comment) => comment.idPerson == widget.userId).toList();
                        
                        if (userComments.isEmpty) {
                          return const Center(child: Text('Aucun post pour cet utilisateur.'));
                        }
                        return RefreshIndicator(
                          onRefresh: () async {
                            final authProvider = Provider.of<AuthProvider>(context, listen: false);
                            _commentBloc.add(LoadMainComments(userId: authProvider.userId));
                          },
                          child: ListView.builder(
                            padding: const EdgeInsets.only(top: 8),
                            itemCount: userComments.length,
                            itemBuilder: (context, index) {
                              final comment = userComments[index];
                              return CommentCard(comment: comment);
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