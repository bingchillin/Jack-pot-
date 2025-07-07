import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../../bloc/comment/comment_list_bloc.dart';
import '../../../bloc/comment/comment_replies_bloc.dart';
import '../../../bloc/comment/comment_replies_event.dart';
import '../../../bloc/comment/comment_replies_state.dart';
import '../../../models/comment_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/comment_service.dart';
import '../../../bloc/comment/comment_detail_bloc.dart';

class CreateReplyModal extends StatefulWidget {
  final Comment parentComment;

  const CreateReplyModal({
    Key? key,
    required this.parentComment,
  }) : super(key: key);

  @override
  State<CreateReplyModal> createState() => _CreateReplyModalState();
}

class _CreateReplyModalState extends State<CreateReplyModal> {
  final TextEditingController _controller = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    // Vérifier l'authentification au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_isUserAuthenticated(context)) {
        Navigator.pop(context);
        _showAuthRequiredSnackBar(context);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // En-tête de la modal
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
                const Expanded(
                  child: Text(
                    'Répondre',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: _isSubmitting ? null : _submitReply,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(
                          'Répondre',
                          style: TextStyle(
                            color: Colors.blue,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ],
            ),
          ),
          // Contenu du commentaire parent
          Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.blue.shade100,
                      child: Text(
                        widget.parentComment.person.firstname[0].toUpperCase(),
                        style: TextStyle(
                          color: Colors.blue.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.parentComment.person.displayName,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            _formatTimeAgo(widget.parentComment.createdAt),
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  widget.parentComment.content,
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
          ),
          // Zone de saisie de la réponse
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _controller,
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                decoration: const InputDecoration(
                  hintText: 'Écrivez votre réponse...',
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: Colors.grey),
                ),
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
        ],
      ),
    );
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

  bool _isUserAuthenticated(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return authProvider.isAuthenticated;
  }

  void _showAuthRequiredSnackBar(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Connectez-vous pour répondre'),
        backgroundColor: Colors.orange,
        action: SnackBarAction(
          label: 'Se connecter',
          textColor: Colors.white,
          onPressed: (){
            Navigator.pushNamed(context, '/login');
          }, // TODO: Ajouter navigation vers login
        ),
      ),
    );
  }

  void _submitReply() async {
    if (!_isUserAuthenticated(context)) {
      _showAuthRequiredSnackBar(context);
      return;
    }

    final content = _controller.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez écrire une réponse')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.accessToken;
      final userId = authProvider.userId;
      await CommentService().createComment(
        content: content,
        parentCommentId: widget.parentComment.idComment,
        token: token!,
        userId: userId,
      );
      // Rafraîchir les réponses du commentaire parent
      context.read<CommentRepliesBloc>().add(RefreshReplies(widget.parentComment.idComment));
      // Rafraîchir la page de détail pour afficher la nouvelle réponse
      context.read<CommentDetailBloc>().add(RefreshCommentDetail(widget.parentComment.idComment));
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Réponse publiée !')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }
} 