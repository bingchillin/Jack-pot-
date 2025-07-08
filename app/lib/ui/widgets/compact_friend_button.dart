import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/contact_model.dart';
import '../../services/contact_service.dart';
import '../../providers/auth_provider.dart';

class CompactFriendButton extends StatefulWidget {
  final int targetUserId;
  final VoidCallback? onStatusChanged;

  const CompactFriendButton({
    Key? key,
    required this.targetUserId,
    this.onStatusChanged,
  }) : super(key: key);

  @override
  State<CompactFriendButton> createState() => _CompactFriendButtonState();
}

class _CompactFriendButtonState extends State<CompactFriendButton> {
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
      setState(() {
        _isInitialLoading = false;
      });
    }
  }

  Future<void> _sendFriendRequest() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;

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
      
      widget.onStatusChanged?.call();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Widget _buildCompactButton() {
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUserId = authProvider.currentUser?.idPerson;
    
    if (currentUserId == null || currentUserId == widget.targetUserId) {
      return const SizedBox.shrink();
    }

    if (_isInitialLoading) {
      return const SizedBox(
        width: 32,
        height: 32,
        child: Center(
          child: SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      );
    }

    if (_currentContact == null) {
      // Pas de relation - afficher bouton "Ajouter"
      return IconButton(
        onPressed: _isLoading ? null : _sendFriendRequest,
        icon: _isLoading 
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.person_add, size: 20),
        tooltip: 'Ajouter en ami',
        style: IconButton.styleFrom(
          backgroundColor: Colors.blue.shade50,
          foregroundColor: Colors.blue,
          padding: const EdgeInsets.all(8),
        ),
      );
    }

    final contact = _currentContact!;
    final isCurrentUserRequester = contact.isRequesterCurrentUser(currentUserId);

    switch (contact.status) {
      case ContactStatus.pending:
        if (isCurrentUserRequester) {
          // Demande envoyée
          return Icon(
            Icons.schedule,
            size: 20,
            color: Colors.orange,
          );
        } else {
          // Demande reçue - on peut afficher un badge ou rien
          return Icon(
            Icons.notification_important,
            size: 20,
            color: Colors.green,
          );
        }

      case ContactStatus.accepted:
        // Amis
        return Icon(
          Icons.check_circle,
          size: 20,
          color: Colors.green,
        );

      case ContactStatus.rejected:
        // Rejeté - permettre de renvoyer
        return IconButton(
          onPressed: _isLoading ? null : _sendFriendRequest,
          icon: _isLoading 
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.refresh, size: 20),
          tooltip: 'Renvoyer la demande',
          style: IconButton.styleFrom(
            backgroundColor: Colors.blue.shade50,
            foregroundColor: Colors.blue,
            padding: const EdgeInsets.all(8),
          ),
        );

      case ContactStatus.blocked:
        // Bloqué
        return Icon(
          Icons.block,
          size: 20,
          color: Colors.red,
        );

      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    return _buildCompactButton();
  }
} 