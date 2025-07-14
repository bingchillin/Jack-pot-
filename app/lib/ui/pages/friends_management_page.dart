import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/contact_model.dart';
import '../../services/contact_service.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';
import 'user_profile_page.dart';

class FriendsManagementPage extends StatefulWidget {
  const FriendsManagementPage({super.key});

  @override
  State<FriendsManagementPage> createState() => _FriendsManagementPageState();
}

class _FriendsManagementPageState extends State<FriendsManagementPage>
    with TickerProviderStateMixin {
  late TabController _tabController;
  final ContactService _contactService = ContactService();
  
  List<Contact> _friends = [];
  List<Contact> _pendingRequests = [];
  List<Contact> _sentRequests = [];
  List<Contact> _blockedUsers = [];
  
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadAllContacts();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllContacts() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) {
      setState(() {
        _error = 'Not authenticated';
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final results = await Future.wait([
        _contactService.getMyContacts(token: token),
        _contactService.getPendingRequests(token: token),
        _contactService.getSentRequests(token: token),
        _contactService.getBlockedContacts(token: token),
      ]);

      setState(() {
        _friends = results[0];
        _pendingRequests = results[1];
        _sentRequests = results[2];
        _blockedUsers = results[3];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.friends),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              icon: Stack(
                children: [
                  const Icon(Icons.people),
                  if (_friends.isNotEmpty)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.green,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${_friends.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              text: localizations.friends,
            ),
            Tab(
              icon: Stack(
                children: [
                  const Icon(Icons.person_add),
                  if (_pendingRequests.isNotEmpty)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.orange,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${_pendingRequests.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              text: localizations.pending,
            ),
            Tab(
              icon: Stack(
                children: [
                  const Icon(Icons.send),
                  if (_sentRequests.isNotEmpty)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${_sentRequests.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              text: localizations.sent,
            ),
            Tab(
              icon: Stack(
                children: [
                  const Icon(Icons.block),
                  if (_blockedUsers.isNotEmpty)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${_blockedUsers.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              text: localizations.blocked,
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
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
                        'Error loading friends',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _error!,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildContactList(_friends, ContactType.friend, localizations),
                    _buildContactList(_pendingRequests, ContactType.pending, localizations),
                    _buildContactList(_sentRequests, ContactType.sent, localizations),
                    _buildContactList(_blockedUsers, ContactType.blocked, localizations),
                  ],
                ),
    );
  }

  Widget _buildContactList(List<Contact> contacts, ContactType type, AppLocalizations localizations) {
    if (contacts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _getEmptyStateIcon(type),
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              _getEmptyStateMessage(type, localizations),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey[800],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      itemCount: contacts.length,
      separatorBuilder: (context, index) => Divider(
        height: 1,
        color: Colors.grey[200],
        indent: 16,
        endIndent: 16,
      ),
      itemBuilder: (context, index) {
        final contact = contacts[index];
        return _buildContactItem(contact, type, localizations);
      },
    );
  }

  Widget _buildContactItem(Contact contact, ContactType type, AppLocalizations localizations) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUserId = authProvider.currentUser?.idPerson ?? 0;
    final otherUser = contact.getOtherUser(currentUserId);
    
    if (otherUser == null) return const SizedBox.shrink();
    
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => UserProfilePage(userId: otherUser.id),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green[400]!, Colors.green[600]!],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Center(
                child: Text(
                  otherUser.displayName.isNotEmpty
                      ? otherUser.displayName[0].toUpperCase()
                      : 'U',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ),
            ),
            
            const SizedBox(width: 12),
            
            // Contact info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    otherUser.displayName,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getContactSubtitle(contact, type),
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            
            // Action buttons
            _buildActionButtons(contact, type, localizations),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(Contact contact, ContactType type, AppLocalizations localizations) {
    switch (type) {
      case ContactType.friend:
        return PopupMenuButton<String>(
          icon: Icon(Icons.more_vert, color: Colors.grey[600]),
          onSelected: (value) {
            if (value == 'block') {
              _blockUser(contact);
            } else if (value == 'remove') {
              _removeFriend(contact);
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'block',
              child: Row(
                children: [
                  Icon(Icons.block, color: Colors.red[600]),
                  const SizedBox(width: 8),
                  const Text('Block'),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'remove',
              child: Row(
                children: [
                  Icon(Icons.person_remove, color: Colors.orange[600]),
                  const SizedBox(width: 8),
                  const Text('Remove'),
                ],
              ),
            ),
          ],
        );
        
      case ContactType.pending:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              onPressed: () => _acceptRequest(contact),
              icon: Icon(Icons.check, color: Colors.green[600]),
              tooltip: 'Accept',
            ),
            IconButton(
              onPressed: () => _rejectRequest(contact),
              icon: Icon(Icons.close, color: Colors.red[600]),
              tooltip: 'Reject',
            ),
          ],
        );
        
      case ContactType.sent:
        return IconButton(
          onPressed: () => _cancelRequest(contact),
          icon: Icon(Icons.cancel, color: Colors.orange[600]),
          tooltip: 'Cancel',
        );
        
      case ContactType.blocked:
        return TextButton(
          onPressed: () => _unblockUser(contact),
          child: Text(
            'Unblock',
            style: TextStyle(color: Colors.blue[600]),
          ),
        );
    }
  }

  IconData _getEmptyStateIcon(ContactType type) {
    switch (type) {
      case ContactType.friend:
        return Icons.people_outline;
      case ContactType.pending:
        return Icons.person_add_outlined;
      case ContactType.sent:
        return Icons.send_outlined;
      case ContactType.blocked:
        return Icons.block_outlined;
    }
  }

  String _getEmptyStateMessage(ContactType type, AppLocalizations localizations) {
    switch (type) {
      case ContactType.friend:
        return 'No friends yet';
      case ContactType.pending:
        return 'No pending requests';
      case ContactType.sent:
        return 'No sent requests';
      case ContactType.blocked:
        return 'No blocked users';
    }
  }

  String _getContactSubtitle(Contact contact, ContactType type) {
    switch (type) {
      case ContactType.friend:
        return 'Friend';
      case ContactType.pending:
        return 'Wants to be friends';
      case ContactType.sent:
        return 'Request sent';
      case ContactType.blocked:
        return 'Blocked';
    }
  }

  // Action methods
  Future<void> _acceptRequest(Contact contact) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;
    
    try {
      await _contactService.acceptFriendRequest(
        contactId: contact.id,
        token: token,
      );
      _loadAllContacts(); // Refresh the lists
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Friend request accepted'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error accepting request: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _rejectRequest(Contact contact) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;
    
    try {
      await _contactService.rejectFriendRequest(
        contactId: contact.id,
        token: token,
      );
      _loadAllContacts(); // Refresh the lists
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Friend request rejected'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error rejecting request: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _cancelRequest(Contact contact) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;
    
    try {
      await _contactService.removeContact(
        contactId: contact.id,
        token: token,
      );
      _loadAllContacts(); // Refresh the lists
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Friend request cancelled'),
            backgroundColor: Colors.blue,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error cancelling request: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _blockUser(Contact contact) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.currentUser?.idPerson;
    final otherUser = contact.getOtherUser(currentUserId ?? 0);
    
    if (token == null || otherUser == null) return;
    
    try {
      await _contactService.blockUser(
        contactId: contact.id,  // ✅ FIXED: Use contact.id instead of otherUser.id
        token: token,
      );
      _loadAllContacts(); // Refresh the lists
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${otherUser.displayName} has been blocked'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error blocking user: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _unblockUser(Contact contact) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.currentUser?.idPerson;
    final otherUser = contact.getOtherUser(currentUserId ?? 0);
    
    if (token == null || otherUser == null) return;
    
    try {
      await _contactService.unblockUser(
        contactId: contact.id,  // ✅ FIXED: Use contact.id instead of otherUser.id
        token: token,
      );
      _loadAllContacts(); // Refresh the lists
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${otherUser.displayName} has been unblocked'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error unblocking user: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _removeFriend(Contact contact) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.currentUser?.idPerson;
    final otherUser = contact.getOtherUser(currentUserId ?? 0);
    
    if (token == null || otherUser == null) return;
    
    // Show confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Friend'),
        content: Text('Are you sure you want to remove ${otherUser.displayName} from your friends?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
    
    if (confirmed != true) return;
    
    try {
      await _contactService.removeContact(
        contactId: contact.id,
        token: token,
      );
      _loadAllContacts(); // Refresh the lists
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${otherUser.displayName} removed from friends'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error removing friend: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}

enum ContactType {
  friend,
  pending,
  sent,
  blocked,
}