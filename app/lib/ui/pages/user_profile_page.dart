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
import '../widgets/user_profile_shimmer.dart';
import 'package:shimmer/shimmer.dart';

class UserProfilePage extends StatefulWidget {
  final int userId;
  const UserProfilePage({super.key, required this.userId});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> with RouteAware {
  late Future<UserProfile> _profileFuture;
  late Future<int> _friendsCountFuture;
  late Future<BlockingStatus> _blockingStatusFuture;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.userId;
    
    _profileFuture = CommentService().fetchUserProfile(widget.userId, token);
    _friendsCountFuture = _getFriendsCount(token);
    _blockingStatusFuture = _checkBlockingStatus(token, currentUserId);
    
    // Use the shared CommentBloc and load main comments if not already loaded
    final commentBloc = context.read<CommentBloc>();
    final currentState = commentBloc.state;
    if (currentState is CommentInitial) {
      commentBloc.add(LoadMainComments(userId: currentUserId));
    }
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

  Future<BlockingStatus> _checkBlockingStatus(String? token, String? currentUserId) async {
    if (token == null || currentUserId == null) return BlockingStatus.notBlocked;
    try {
      final contactService = ContactService();
      return await contactService.checkBlockingStatus(
        currentUserId: int.parse(currentUserId),
        targetUserId: widget.userId,
        token: token,
      );
    } catch (e) {
      print('Error checking blocking status: $e');
      return BlockingStatus.notBlocked;
    }
  }

  @override
  void dispose() {
    // Don't close the shared CommentBloc
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
            return const UserProfileShimmer();
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
          
          // Always show normal profile, but check blocking for comments section
          return _buildNormalProfileView(profile);
        },
      ),
    );
  }

  Widget _buildBlockedCommentsSection(BlockingStatus blockingStatus) {
    final localizations = AppLocalizations.of(context)!;
    String message;
    IconData icon;
    Color iconColor;
    
    switch (blockingStatus) {
      case BlockingStatus.youBlockedThem:
        message = localizations.youBlockedThisUserPosts;
        icon = Icons.block;
        iconColor = Colors.red;
        break;
      case BlockingStatus.theyBlockedYou:
        message = localizations.thisUserBlockedYouPosts;
        icon = Icons.lock;
        iconColor = Colors.orange;
        break;
      default:
        return const SizedBox.shrink();
    }
    
    return Container(
      padding: const EdgeInsets.all(32),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: iconColor.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 32,
              color: iconColor,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[700],
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
          if (blockingStatus == BlockingStatus.youBlockedThem) ...[
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: () {
                // Navigate to blocked users page
                Navigator.pushNamed(context, '/blocked-users');
              },
              icon: const Icon(Icons.settings, size: 18),
              label: Text(localizations.manageBlockedUsers),
              style: TextButton.styleFrom(
                foregroundColor: Colors.green[600],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNormalProfileView(UserProfile profile) {
    final localizations = AppLocalizations.of(context)!;
    
    return RefreshIndicator(
            onRefresh: () async {
              // Refresh profile data
              final authProvider = Provider.of<AuthProvider>(context, listen: false);
              setState(() {
                _profileFuture = CommentService().fetchUserProfile(widget.userId, authProvider.accessToken);
                _friendsCountFuture = _getFriendsCount(authProvider.accessToken);
                _blockingStatusFuture = _checkBlockingStatus(authProvider.accessToken, authProvider.userId);
              });
              
              // Refresh comments
              context.read<CommentBloc>().add(LoadMainComments(userId: authProvider.userId));
              
              // Wait for the futures to complete
              await _profileFuture;
              await _friendsCountFuture;
              await _blockingStatusFuture;
            },
            color: Colors.green[600],
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(), // Enable pull-to-refresh even when content doesn't fill screen
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
                  
                  // Posts list with blocking check
                  FutureBuilder<BlockingStatus>(
                    future: _blockingStatusFuture,
                    builder: (context, blockingSnapshot) {
                      final blockingStatus = blockingSnapshot.data ?? BlockingStatus.notBlocked;
                      
                      // Show blocking message instead of comments if blocked
                      if (blockingStatus != BlockingStatus.notBlocked) {
                        return _buildBlockedCommentsSection(blockingStatus);
                      }
                      
                      // Show normal comments if not blocked
                      return BlocBuilder<CommentBloc, CommentState>(
                        builder: (context, state) {
                          if (state is CommentLoading) {
                            return Column(
                              children: List.generate(3, (index) => _buildCommentShimmer()),
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
                      );
                    },
                  ),
                  ],
                ),
              ),
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

  Widget _buildCommentShimmer() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      decoration: BoxDecoration(
        color: Colors.green[50],
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with user info and actions
          Row(
            children: [
              // Avatar shimmer
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // User information
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        // Username
                        Shimmer.fromColors(
                          baseColor: Colors.grey[300]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(
                            width: 120,
                            height: 16,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Tag
                        Shimmer.fromColors(
                          baseColor: Colors.grey[300]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(
                            width: 60,
                            height: 20,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Time
                        Shimmer.fromColors(
                          baseColor: Colors.grey[300]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(
                            width: 40,
                            height: 14,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Options menu
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.only(left: 64, right: 16, top: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  child: Container(
                    width: double.infinity,
                    height: 16,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  child: Container(
                    width: 200,
                    height: 16,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Action buttons
          Padding(
            padding: const EdgeInsets.only(left: 64, right: 16, top: 8),
            child: Row(
              children: [
                // Like button
                Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  child: Container(
                    width: 40,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Reply button
                Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  child: Container(
                    width: 40,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
} 