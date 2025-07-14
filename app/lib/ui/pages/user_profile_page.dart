import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/user_profile_model.dart';
import '../../services/comment_service.dart';
import '../../services/contact_service.dart';
import '../../models/contact_model.dart';
import '../../providers/auth_provider.dart';
import 'widget/comment_card.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/comment/comment_bloc.dart';
import '../widgets/friend_request_button.dart';
import '../../l10n/app_localizations.dart';

class UserProfilePage extends StatefulWidget {
  final int userId;
  const UserProfilePage({super.key, required this.userId});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> with RouteAware {
  late Future<UserProfile> _profileFuture;
  late CommentBloc _commentBloc;
  late Future<int> _friendsCountFuture;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.userId;
    
    _profileFuture = CommentService().fetchUserProfile(widget.userId, token);
    _friendsCountFuture = _getFriendsCount(token);
    
    // Créer un bloc dédié pour ce profil utilisateur
    _commentBloc = CommentBloc(
      commentService: CommentService(),
      token: token,
    );
    
    // Charger les commentaires de l'utilisateur
    _commentBloc.add(LoadMainComments(userId: currentUserId));
  }

  Future<int> _getFriendsCount(String? token) async {
    if (token == null) return 0;
    try {
      // Get all contacts for this user and count accepted ones
      final contactService = ContactService();
      final contacts = await contactService.getMyContacts(token: token);
      // Filter contacts that involve the target user and are accepted
      final userContacts = contacts.where((contact) => 
        (contact.requesterId == widget.userId || contact.receiverId == widget.userId) &&
        contact.status == ContactStatus.accepted
      ).toList();
      return userContacts.length;
    } catch (e) {
      print('Error getting friends count: $e');
      return 0;
    }
  }

  @override
  void dispose() {
    _commentBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Scaffold(
      backgroundColor: Colors.green[50],
      appBar: AppBar(
        backgroundColor: Colors.green[50], // Same as comment cards background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          localizations.profile,
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
        ),
      ),
      body: FutureBuilder<UserProfile>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF22c55e)));
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'Erreur: ${snapshot.error}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }
          final profile = snapshot.data!;
          return SingleChildScrollView(
            child: Container(
              color: Colors.green[50], // Same as comment cards background
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  // Profile picture and info
                  Container(
                    padding: const EdgeInsets.all(16),
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
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
                            // Profile picture
                            Row(
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 4),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.1),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: CircleAvatar(
                                    radius: 40,
                                    backgroundColor: const Color(0xFF22c55e),
                                    child: Text(
                                      profile.firstname.isNotEmpty ? profile.firstname[0].toUpperCase() : 'U',
                                      style: const TextStyle(
                                        fontSize: 32,
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                const Spacer(),
                                // Friend request button
                                FriendRequestButton(
                                  targetUserId: widget.userId,
                                  onStatusChanged: () {
                                    print('Statut d\'ami changé pour l\'utilisateur ${widget.userId}');
                                    // Refresh friends count when status changes
                                    setState(() {
                                      _friendsCountFuture = _getFriendsCount(
                                        Provider.of<AuthProvider>(context, listen: false).accessToken
                                      );
                                    });
                                  },
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Name and handle
                            Text(
                              '${profile.firstname} ${profile.surname}',
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            
                            const SizedBox(height: 4),
                            
                            Text(
                              '@${profile.email.split('@')[0]}',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey[600],
                              ),
                            ),
                            
                            const SizedBox(height: 12),
                            
                            // Join date with icon
                            if (profile.createdAt != null)
                              Row(
                                children: [
                                  Icon(Icons.calendar_today, size: 16, color: const Color(0xFF22c55e)),
                                  const SizedBox(width: 6),
                                  Text(
                                    '${localizations.memberSince} ${_getMonthName(profile.createdAt!.month, localizations)} ${profile.createdAt!.year}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            
                            const SizedBox(height: 20),
                            
                            // Stats row (friends count)
                            FutureBuilder<int>(
                              future: _friendsCountFuture,
                              builder: (context, snapshot) {
                                final friendsCount = snapshot.data ?? 0;
                                return Row(
                                  children: [
                                    _buildStatItem(friendsCount.toString(), localizations.friends),
                                  ],
                                );
                              },
                            ),
                            
                            // Posts header
                            Container(
                              margin: const EdgeInsets.only(top: 16),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                border: Border(
                                  top: BorderSide(color: Colors.grey[200]!, width: 1),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.article_outlined, size: 20, color: const Color(0xFF22c55e)),
                                  const SizedBox(width: 8),
                                  Text(
                                    localizations.publications,
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey[800],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Posts list
                  BlocProvider.value(
                    value: _commentBloc,
                    child: BlocBuilder<CommentBloc, CommentState>(
                    builder: (context, state) {
                      if (state is CommentLoading) {
                        return Container(
                          height: 200,
                          child: const Center(
                            child: CircularProgressIndicator(color: Color(0xFF22c55e)),
                          ),
                        );
                      }
                      if (state is CommentError) {
                        return Container(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            children: [
                              Icon(Icons.error_outline, size: 48, color: Colors.grey[400]),
                              const SizedBox(height: 16),
                              Text(
                                'Erreur: ${state.message}',
                                style: TextStyle(color: Colors.grey[600]),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        );
                      }
                      if (state is CommentMainLoaded) {
                        // Filter comments for this user
                        final userComments = state.comments
                            .where((comment) => comment.idPerson == widget.userId)
                            .toList();
                        
                        if (userComments.isEmpty) {
                          return Container(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              children: [
                                Icon(Icons.article_outlined, size: 48, color: Colors.grey[400]),
                                const SizedBox(height: 16),
                                Text(
                                  localizations.noPublications,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  localizations.noPublicationsDescription,
                                  style: TextStyle(color: Colors.grey[500]),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          );
                        }
                        
                        return Column(
                          children: userComments.map((comment) {
                            return CommentCard(comment: comment);
                          }).toList(),
                        );
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
  
  Widget _buildStatItem(String count, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          count,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
  
  String _getMonthName(int month, AppLocalizations localizations) {
    // Use localized month names based on current locale
    final locale = Localizations.localeOf(context);
    final monthNames = {
      'en': ['', 'January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December'],
      'fr': ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
             'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
      'es': ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
             'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    };
    
    final languageCode = locale.languageCode;
    final months = monthNames[languageCode] ?? monthNames['en']!;
    
    return month >= 1 && month <= 12 ? months[month] : '';
  }
} 