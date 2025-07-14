import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/contact_model.dart';
import '../../services/contact_service.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';

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

    // Confirmation is now handled by _showUnfollowConfirmation

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

  Future<void> _showUnfollowConfirmation(AppLocalizations localizations) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(localizations.unfollowConfirmTitle),
        content: Text(localizations.unfollowConfirmMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(localizations.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text(localizations.unfollow),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _removeContact();
      // Notify parent that status changed so friends list can refresh
      if (widget.onStatusChanged != null) {
        widget.onStatusChanged!();
      }
    }
  }

  Widget _buildButton() {
    final authProvider = Provider.of<AuthProvider>(context);
    final localizations = AppLocalizations.of(context)!;
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
      // No relationship - show "Follow" button (Twitter-like)
      return ElevatedButton(
        onPressed: _isLoading ? null : _sendFriendRequest,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black87,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          elevation: 0,
          minimumSize: const Size(100, 36),
        ),
        child: _isLoading 
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            )
          : Text(
              localizations.follow,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
      );
    }

    final contact = _currentContact!;
    final isCurrentUserRequester = contact.isRequesterCurrentUser(currentUserId);

    switch (contact.status) {
      case ContactStatus.pending:
        if (isCurrentUserRequester) {
          // Current user sent the request - show "Pending"
          return OutlinedButton(
            onPressed: null,
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.grey[700],
              side: BorderSide(color: Colors.grey[300]!),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              minimumSize: const Size(100, 36),
            ),
            child: Text(
              localizations.pending,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          );
        } else {
          // Current user received the request - show Accept/Reject buttons
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              ElevatedButton(
                onPressed: _isLoading ? null : _acceptFriendRequest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF22c55e),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  elevation: 0,
                  minimumSize: const Size(80, 36),
                ),
                child: _isLoading 
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(
                      localizations.accept,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: _isLoading ? null : _rejectFriendRequest,
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.grey[700],
                  side: BorderSide(color: Colors.grey[300]!),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  minimumSize: const Size(80, 36),
                ),
                child: Text(
                  localizations.reject,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          );
        }

      case ContactStatus.accepted:
        // Already friends - show "Following" button that directly unfollows
        return ElevatedButton(
          onPressed: _isLoading ? null : () => _showUnfollowConfirmation(localizations),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: Colors.grey[700],
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(color: Colors.grey[300]!),
            ),
            elevation: 0,
            minimumSize: const Size(100, 36),
          ),
          child: _isLoading 
            ? SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.grey[700]),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check, color: const Color(0xFF22c55e), size: 16),
                  const SizedBox(width: 6),
                  Text(
                    localizations.following,
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
        );

      case ContactStatus.rejected:
        // Request was rejected - show "Follow" again
        return ElevatedButton(
          onPressed: _isLoading ? null : _sendFriendRequest,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black87,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            elevation: 0,
            minimumSize: const Size(100, 36),
          ),
          child: _isLoading 
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : Text(
                localizations.follow,
                style: const TextStyle(fontWeight: FontWeight.w600),
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
              Text(localizations.block, style: const TextStyle(color: Colors.red)),
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