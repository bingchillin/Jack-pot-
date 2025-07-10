import 'package:flutter/material.dart';
import '../../../models/comment_model.dart';
import '../comment_detail_page.dart';
import 'create_reply_modal.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../user_profile_page.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../services/contact_service.dart';
import '../../../services/comment_flag_service.dart';
import '../../widgets/comment_image_widget.dart';
import '../../widgets/tag_selector_widget.dart';
import '../../widgets/flag_reason_dialog.dart';
import '../../widgets/user_mention_suggestions.dart';

class CommentCard extends StatefulWidget {
  final Comment comment;
  final bool showReplies;
  final Function()? onLikeChanged;

  const CommentCard({
    super.key,
    required this.comment,
    this.showReplies = false,
    this.onLikeChanged,
  });

  @override
  State<CommentCard> createState() => _CommentCardState();
}

class _CommentCardState extends State<CommentCard> {
  late Comment _currentComment;
  bool _isUserBlocked = false;

  @override
  void initState() {
    super.initState();
    _currentComment = widget.comment;
    _checkIfUserIsBlocked();
  }

  @override
  void didUpdateWidget(CommentCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.comment != widget.comment) {
      _currentComment = widget.comment;
    }
  }
  
  Future<void> _checkIfUserIsBlocked() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final currentUserId = authProvider.currentUser?.idPerson;
    
    if (token != null && currentUserId != null) {
      try {
        final contactService = ContactService();
              final existingContact = await contactService.getContactStatus(
        userId: _currentComment.person.idPerson,
        token: token,
      );
        
        if (mounted) {
          setState(() {
            _isUserBlocked = existingContact?.isBlocked ?? false;
          });
        }
      } catch (e) {
        print('Error checking user block status: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final comment = _currentComment;
    final isAuthenticated = Provider.of<AuthProvider>(context, listen: false).isAuthenticated;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    return BlocListener<CommentBloc, CommentState>(
      listener: (context, state) {
        if (state is CommentLikeUpdated && state.commentId == comment.idComment) {
          setState(() {
            _currentComment = _currentComment.copyWith(
              isLikedByCurrentUser: state.isLiked,
              likeCount: state.likeCount,
            );
          });
        }
      },
      child: GestureDetector(
        onTap: () {
          _navigateToDetail(context);
        },
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 3,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête du commentaire
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    // Avatar
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => UserProfilePage(userId: comment.person.idPerson),
                          ),
                        );
                      },
                      child: CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.blue.shade100,
                        child: Text(
                          comment.person.firstname.isNotEmpty 
                              ? comment.person.firstname[0].toUpperCase()
                              : 'U',
                          style: TextStyle(
                            color: Colors.blue.shade700,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Informations utilisateur
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                comment.person.displayName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              if (comment.tag != null) ...[
                                const SizedBox(width: 8),
                                TagDisplayWidget(
                                  tag: comment.tag!,
                                  isSmall: true,
                                ),
                              ],
                            ],
                          ),
                          Text(
                            _formatTimeAgo(comment.createdAt),
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Menu d'options
                    if (isAuthenticated)
                      PopupMenuButton<String>(
                        onSelected: (value) {
                          _handleMenuAction(context, value);
                        },
                        itemBuilder: (context) => [
                          PopupMenuItem(
                            value: 'report',
                            child: Row(
                              children: [
                                Icon(Icons.flag, size: 18, color: Colors.red.shade600),
                                const SizedBox(width: 8),
                                const Text('Signaler'),
                              ],
                            ),
                          ),
                          PopupMenuItem(
                            value: 'block',
                            child: Row(
                              children: [
                                Icon(Icons.block, size: 18, color: Colors.red.shade600),
                                const SizedBox(width: 8),
                                Text(_isUserBlocked ? 'Débloquer' : 'Bloquer'),
                              ],
                            ),
                          ),
                          if (authProvider.currentUser?.idPerson == comment.person.idPerson)
                            PopupMenuItem(
                              value: 'delete',
                              child: Row(
                                children: [
                                  Icon(Icons.delete, size: 18, color: Colors.red.shade600),
                                  const SizedBox(width: 8),
                                  const Text('Supprimer'),
                                ],
                              ),
                            ),
                        ],
                      ),
                  ],
                ),
              ),
              // Contenu du commentaire
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (comment.content.isNotEmpty)
                      MentionRichText(
                        text: comment.content,
                        mentions: comment.mentions,
                        textStyle: const TextStyle(fontSize: 16, height: 1.4),
                        onMentionTap: (userId) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => UserProfilePage(userId: userId),
                            ),
                          );
                        },
                      ),
                    // Affichage de l'image si présente
                    if (comment.imageUrl != null && comment.imageUrl!.isNotEmpty)
                      CommentImageWidget(imageUrl: comment.imageUrl!),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Ligne d'actions
              Padding(
                padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    // Bouton répondre
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.chat_bubble_outline, color: Colors.blue),
                          tooltip: 'Répondre',
                          color: isAuthenticated ? Colors.blue : Colors.grey.shade400,
                          onPressed: isAuthenticated
                              ? () {
                                  showModalBottomSheet(
                                    context: context,
                                    isScrollControlled: true,
                                    shape: const RoundedRectangleBorder(
                                      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                                    ),
                                    builder: (context) => CreateReplyModal(parentComment: _currentComment),
                                  );
                                }
                              : () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Connectez-vous pour répondre')),
                                  );
                                },
                        ),
                        if (comment.replyCount > 0)
                          Positioned(
                            right: 4,
                            top: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.blue,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '${comment.replyCount}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    // Bouton like
                    Row(
                      children: [
                        IconButton(
                          icon: Icon(
                            comment.isLikedByCurrentUser ? Icons.favorite : Icons.favorite_border,
                            color: comment.isLikedByCurrentUser ? Colors.red : Colors.grey.shade600,
                            size: 22,
                          ),
                          tooltip: comment.isLikedByCurrentUser ? 'Retirer le like' : 'Liker',
                          onPressed: isAuthenticated
                              ? () {
                                  context.read<CommentBloc>().add(
                                    LikeComment(comment.idComment, authProvider.currentUser!.idPerson.toString()),
                                  );
                                  widget.onLikeChanged?.call();
                                }
                              : () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Connectez-vous pour liker')),
                                  );
                                },
                        ),
                        const SizedBox(width: 2),
                        Text(
                          '${comment.likeCount}',
                          style: TextStyle(
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToDetail(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CommentDetailPage(commentId: _currentComment.idComment),
      ),
    );
  }

  void _handleMenuAction(BuildContext context, String action) {
    switch (action) {
      case 'block':
        _showBlockUserDialog(context);
        break;
      case 'unblock':
        _showUnblockUserDialog(context);
        break;
      case 'report':
        _showReportDialog(context);
        break;
      case 'delete':
        _showDeleteDialog(context);
        break;
    }
  }

  void _showBlockUserDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bloquer cet utilisateur'),
        content: Text(
          'Êtes-vous sûr de vouloir bloquer ${_currentComment.person.displayName} ?\n\n'
          'Vous ne verrez plus ses commentaires et il ne pourra plus vous contacter.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _blockUser(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Bloquer'),
          ),
        ],
      ),
    );
  }

  void _showUnblockUserDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Débloquer cet utilisateur'),
        content: Text(
          'Êtes-vous sûr de vouloir débloquer ${_currentComment.person.displayName} ?\n\n'
          'Vous pourrez à nouveau voir ses commentaires et il pourra vous contacter.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _unblockUser(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.green),
            child: const Text('Débloquer'),
          ),
        ],
      ),
    );
  }

  void _showReportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => FlagReasonDialog(
        onFlag: (reason, details) {
          _flagComment(context, reason, details);
        },
      ),
    );
  }

  Future<void> _flagComment(BuildContext context, String reason, String? details) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final userId = authProvider.currentUser?.idPerson;
    
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    if (token == null || userId == null) {
      scaffoldMessenger.showSnackBar(
        const SnackBar(content: Text('Vous devez être connecté pour signaler un commentaire')),
      );
      return;
    }

    try {
      final commentFlagService = CommentFlagService();
      final result = await commentFlagService.flagComment(
        commentId: _currentComment.idComment,
        idPerson: userId,
        reason: reason,
        details: details,
        token: token,
      );
      
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Commentaire signalé (${result['flagCount']} signalement${result['flagCount'] > 1 ? 's' : ''})'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Erreur: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showDeleteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le commentaire'),
        content: const Text(
          'Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteComment(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteComment(BuildContext context) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final commentBloc = context.read<CommentBloc>();
    
    if (!authProvider.isAuthenticated) {
      scaffoldMessenger.showSnackBar(
        const SnackBar(content: Text('Vous devez être connecté pour supprimer un commentaire')),
      );
      return;
    }

    try {
      commentBloc.add(DeleteComment(_currentComment.idComment));
      
      scaffoldMessenger.showSnackBar(
        const SnackBar(
          content: Text('Commentaire supprimé'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la suppression: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _blockUser(BuildContext context) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final userId = authProvider.currentUser?.idPerson.toString();
    
    // Stocker les références avant les opérations async
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final commentBloc = context.read<CommentBloc>();
    
    if (token == null) {
      if (mounted) {
        scaffoldMessenger.showSnackBar(
          const SnackBar(content: Text('Erreur: Token non disponible')),
        );
      }
      return;
    }

    try {
      // Créer ou mettre à jour la relation de contact pour bloquer
      final contactService = ContactService();
      
      // D'abord, vérifier s'il y a déjà une relation
      final existingContact = await contactService.getContactStatus(
        userId: _currentComment.person.idPerson,
        token: token,
      );

      bool isAlreadyBlocked = false;

      if (existingContact != null) {
        if (existingContact.isBlocked) {
          // L'utilisateur est déjà bloqué
          isAlreadyBlocked = true;
        } else {
          // Bloquer la relation existante
          await contactService.blockUser(
            contactId: existingContact.id,
            token: token,
          );
        }
      } else {
        // Envoyer d'abord une demande puis la bloquer immédiatement
        try {
          final newContact = await contactService.sendFriendRequest(
            receiverId: _currentComment.person.idPerson,
            token: token,
          );
          
          await contactService.blockUser(
            contactId: newContact.id,
            token: token,
          );
        } catch (requestError) {
          // Si on ne peut pas envoyer la demande car l'utilisateur est déjà bloqué
          if (requestError.toString().contains('user is blocked')) {
            isAlreadyBlocked = true;
          } else {
            rethrow; // Re-lancer l'erreur si c'est autre chose
          }
        }
      }

      if (mounted) {
        if (isAlreadyBlocked) {
          scaffoldMessenger.showSnackBar(
            SnackBar(
              content: Text('${_currentComment.person.displayName} est déjà bloqué'),
              backgroundColor: Colors.orange,
            ),
          );
        } else {
          scaffoldMessenger.showSnackBar(
            SnackBar(
              content: Text('${_currentComment.person.displayName} a été bloqué'),
              backgroundColor: Colors.green,
            ),
          );
        }

        // Attendre un peu pour que le blocage soit effectif côté serveur
        await Future.delayed(const Duration(milliseconds: 500));

        // Recharger les commentaires pour faire disparaître ceux de l'utilisateur bloqué
        commentBloc.add(LoadMainComments(userId: userId));
      }

    } catch (e) {
      print('Error blocking user: $e');
      if (mounted) {
                  // Vérifier si l'utilisateur est déjà bloqué
          if (e.toString().contains('user is blocked') || e.toString().contains('403')) {
            scaffoldMessenger.showSnackBar(
              SnackBar(
                content: Text('${_currentComment.person.displayName} est déjà bloqué'),
                backgroundColor: Colors.orange,
              ),
            );
            // Recharger quand même pour actualiser la liste
            await Future.delayed(const Duration(milliseconds: 500));
            commentBloc.add(LoadMainComments(userId: userId));
        } else {
          scaffoldMessenger.showSnackBar(
            SnackBar(
              content: Text('Erreur lors du blocage: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _unblockUser(BuildContext context) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final userId = authProvider.currentUser?.idPerson.toString();
    
    // Stocker les références avant les opérations async
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final commentBloc = context.read<CommentBloc>();
    
    if (token == null) {
      if (mounted) {
        scaffoldMessenger.showSnackBar(
          const SnackBar(content: Text('Erreur: Token non disponible')),
        );
      }
      return;
    }

    try {
      final contactService = ContactService();
      
      // Récupérer le contact existant
      final existingContact = await contactService.getContactStatus(
        userId: _currentComment.person.idPerson,
        token: token,
      );

      if (existingContact != null && existingContact.isBlocked) {
        // Débloquer l'utilisateur
        await contactService.unblockUser(
          contactId: existingContact.id,
          token: token,
        );

        // Le backend change automatiquement le status en ACCEPTED après déblocage
        // Pour éviter que l'utilisateur devienne ami automatiquement, on supprime la relation
        try {
          await contactService.removeContact(
            contactId: existingContact.id,
            token: token,
          );
          print('🧹 Contact relation removed after unblock to avoid auto-friendship');
        } catch (removeError) {
          print('Warning: Could not remove contact after unblock: $removeError');
          // Continue même si la suppression échoue
        }

        if (mounted) {
          scaffoldMessenger.showSnackBar(
            SnackBar(
              content: Text('${_currentComment.person.displayName} a été débloqué'),
              backgroundColor: Colors.green,
            ),
          );

          // Mettre à jour l'état local
          setState(() {
            _isUserBlocked = false;
          });

          // Attendre un peu pour que le déblocage soit effectif côté serveur
          await Future.delayed(const Duration(milliseconds: 500));
          
          // Recharger les commentaires (toujours avec des données fraîches)
          commentBloc.add(LoadMainComments(userId: userId));
        }
      } else {
        if (mounted) {
          scaffoldMessenger.showSnackBar(
            SnackBar(
              content: Text('${_currentComment.person.displayName} n\'est pas bloqué'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }

    } catch (e) {
      print('Error unblocking user: $e');
      if (mounted) {
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Erreur lors du déblocage: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return 'Il y a ${difference.inDays}j';
    } else if (difference.inHours > 0) {
      return 'Il y a ${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return 'Il y a ${difference.inMinutes}min';
    } else {
      return 'À l\'instant';
    }
  }
} 