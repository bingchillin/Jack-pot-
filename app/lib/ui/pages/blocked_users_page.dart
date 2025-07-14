import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/contact_service.dart';
import '../../models/contact_model.dart';
import '../../providers/auth_provider.dart';

class BlockedUsersPage extends StatefulWidget {
  const BlockedUsersPage({super.key});

  @override
  State<BlockedUsersPage> createState() => _BlockedUsersPageState();
}

class _BlockedUsersPageState extends State<BlockedUsersPage> {
  List<Contact> _blockedContacts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBlockedUsers();
  }

  Future<void> _loadBlockedUsers() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;

    if (token != null) {
      try {
        final contactService = ContactService();
        final blockedContacts = await contactService.getBlockedContacts(token: token);
        
        if (mounted) {
          setState(() {
            _blockedContacts = blockedContacts;
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erreur lors du chargement: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _unblockUser(Contact contact) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.currentUser?.idPerson;

    if (token == null || currentUserId == null) return;

    try {
      final contactService = ContactService();
      
      await contactService.unblockUser(
        contactId: contact.id,
        token: token,
      );

      // Le backend change automatiquement le status en ACCEPTED après déblocage
      // Pour éviter que l'utilisateur devienne ami automatiquement, on supprime la relation
      try {
        await contactService.removeContact(
          contactId: contact.id,
          token: token,
        );
      } catch (removeError) {
        // Continue même si la suppression échoue
      }

      // Récupérer le nom de l'utilisateur débloqué
      final otherUser = contact.getOtherUser(currentUserId);
      final userName = otherUser?.displayName ?? 'Utilisateur';

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$userName a été débloqué'),
            backgroundColor: Colors.green,
          ),
        );

        // Recharger la liste
        _loadBlockedUsers();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du déblocage: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showUnblockDialog(Contact contact) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUserId = authProvider.currentUser?.idPerson;
    final otherUser = contact.getOtherUser(currentUserId!);
    final userName = otherUser?.displayName ?? 'Utilisateur';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Débloquer cet utilisateur'),
        content: Text(
          'Êtes-vous sûr de vouloir débloquer $userName ?\n\n'
          'Vous pourrez à nouveau voir ses contenus et il pourra vous contacter.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _unblockUser(contact);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.green),
            child: const Text('Débloquer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUserId = authProvider.currentUser?.idPerson;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Utilisateurs bloqués'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _blockedContacts.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.check_circle_outline,
                        size: 64,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Aucun utilisateur bloqué',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Vous n\'avez bloqué aucun utilisateur.',
                        style: TextStyle(
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadBlockedUsers,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _blockedContacts.length,
                    itemBuilder: (context, index) {
                      final contact = _blockedContacts[index];
                      final otherUser = contact.getOtherUser(currentUserId!);
                      
                      if (otherUser == null) return const SizedBox.shrink();

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.red.shade100,
                            child: Text(
                              otherUser.firstname.isNotEmpty
                                  ? otherUser.firstname[0].toUpperCase()
                                  : 'U',
                              style: TextStyle(
                                color: Colors.red.shade700,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(
                            otherUser.displayName,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            'Bloqué le ${_formatDate(contact.updatedAt)}',
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                          trailing: ElevatedButton.icon(
                            onPressed: () => _showUnblockDialog(contact),
                            icon: const Icon(Icons.check_circle, size: 18),
                            label: const Text('Débloquer'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              elevation: 0,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  String _formatDate(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays} jour${difference.inDays > 1 ? 's' : ''} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} heure${difference.inHours > 1 ? 's' : ''} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
    } else {
      return 'À l\'instant';
    }
  }
} 