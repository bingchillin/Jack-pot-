import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/contact_model.dart';
import '../../services/contact_service.dart';
import '../../providers/auth_provider.dart';

class FriendRequestButton extends StatefulWidget {
  final int targetUserId;
  final VoidCallback? onStatusChanged;

  const FriendRequestButton({
    Key? key,
    required this.targetUserId,
    this.onStatusChanged,
  }) : super(key: key);

  @override
  State<FriendRequestButton> createState() => _FriendRequestButtonState();
}

class _FriendRequestButtonState extends State<FriendRequestButton> {
  final ContactService _contactService = ContactService();
  Contact? _currentContact;
  bool _isLoading = false;
  bool _isInitialLoading = true;

  @override
  void initState() {
    super.initState();
    _loadContactStatus();
  }

  Future<void> _loadContactStatus() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;

    setState(() {
      _isInitialLoading = true;
    });

    try {
      final contact = await _contactService.getContactStatus(
        userId: widget.targetUserId,
        token: token,
      );
      
      setState(() {
        _currentContact = contact;
        _isInitialLoading = false;
      });
    } catch (e) {
      print('Error loading contact status: $e');
      setState(() {
        _isInitialLoading = false;
      });
    }
  }

  Future<void> _sendFriendRequest() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) {
      _showMessage('Vous devez être connecté pour envoyer une demande d\'ami');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final contact = await _contactService.sendFriendRequest(
        receiverId: widget.targetUserId,
        token: token,
      );
      
      setState(() {
        _currentContact = contact;
        _isLoading = false;
      });
      
      _showMessage('Demande d\'ami envoyée !');
      widget.onStatusChanged?.call();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showMessage('Erreur: ${e.toString()}');
    }
  }

  Future<void> _acceptFriendRequest() async {
    if (_currentContact == null) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final updatedContact = await _contactService.acceptFriendRequest(
        contactId: _currentContact!.id,
        token: token,
      );
      
      setState(() {
        _currentContact = updatedContact;
        _isLoading = false;
      });
      
      _showMessage('Demande d\'ami acceptée !');
      widget.onStatusChanged?.call();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showMessage('Erreur: ${e.toString()}');
    }
  }

  Future<void> _rejectFriendRequest() async {
    if (_currentContact == null) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final updatedContact = await _contactService.rejectFriendRequest(
        contactId: _currentContact!.id,
        token: token,
      );
      
      setState(() {
        _currentContact = updatedContact;
        _isLoading = false;
      });
      
      _showMessage('Demande d\'ami rejetée');
      widget.onStatusChanged?.call();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showMessage('Erreur: ${e.toString()}');
    }
  }

  Future<void> _removeContact() async {
    if (_currentContact == null) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;

    // Demander confirmation
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le contact'),
        content: const Text('Êtes-vous sûr de vouloir supprimer ce contact ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isLoading = true;
    });

    try {
      await _contactService.removeContact(
        contactId: _currentContact!.id,
        token: token,
      );
      
      setState(() {
        _currentContact = null;
        _isLoading = false;
      });
      
      _showMessage('Contact supprimé');
      widget.onStatusChanged?.call();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showMessage('Erreur: ${e.toString()}');
    }
  }

  void _showMessage(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  Widget _buildButton() {
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUserId = authProvider.currentUser?.idPerson;
    
    if (currentUserId == null) {
      return const SizedBox.shrink();
    }

    // Ne pas afficher de bouton pour soi-même
    if (currentUserId == widget.targetUserId) {
      return const SizedBox.shrink();
    }

    if (_isInitialLoading) {
      return const SizedBox(
        width: 120,
        height: 36,
        child: Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      );
    }

    if (_currentContact == null) {
      // Pas de relation - afficher bouton "Ajouter"
      return ElevatedButton.icon(
        onPressed: _isLoading ? null : _sendFriendRequest,
        icon: _isLoading 
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.person_add, size: 16),
        label: const Text('Ajouter'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      );
    }

    final contact = _currentContact!;
    final isCurrentUserRequester = contact.isRequesterCurrentUser(currentUserId);

    switch (contact.status) {
      case ContactStatus.pending:
        if (isCurrentUserRequester) {
          // Demande envoyée - afficher statut
          return OutlinedButton.icon(
            onPressed: null,
            icon: const Icon(Icons.schedule, size: 16),
            label: const Text('En attente'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.orange,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
          );
        } else {
          // Demande reçue - afficher boutons accepter/rejeter
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _acceptFriendRequest,
                icon: _isLoading 
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.check, size: 16),
                label: const Text('Accepter'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: _isLoading ? null : _rejectFriendRequest,
                icon: const Icon(Icons.close, size: 16),
                label: const Text('Rejeter'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
            ],
          );
        }

      case ContactStatus.accepted:
        // Amis - afficher statut avec option de suppression
        return PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'remove') {
              _removeContact();
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'remove',
              child: Row(
                children: [
                  Icon(Icons.person_remove, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Supprimer le contact'),
                ],
              ),
            ),
          ],
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              border: Border.all(color: Colors.green),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 16),
                const SizedBox(width: 4),
                const Text('Amis'),
                const SizedBox(width: 4),
                Icon(Icons.arrow_drop_down, color: Colors.green, size: 16),
              ],
            ),
          ),
        );

      case ContactStatus.rejected:
        // Demande rejetée - permettre de renvoyer
        return OutlinedButton.icon(
          onPressed: _isLoading ? null : _sendFriendRequest,
          icon: _isLoading 
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.refresh, size: 16),
          label: const Text('Renvoyer'),
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.blue,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          ),
        );

      case ContactStatus.blocked:
        // Bloqué - ne rien afficher ou afficher un message
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.red.shade50,
            border: Border.all(color: Colors.red),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.block, color: Colors.red, size: 16),
              const SizedBox(width: 4),
              const Text('Bloqué', style: TextStyle(color: Colors.red)),
            ],
          ),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    return _buildButton();
  }
} 