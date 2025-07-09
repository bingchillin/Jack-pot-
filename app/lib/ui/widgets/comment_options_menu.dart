import 'package:flutter/material.dart';
import '../../models/comment_model.dart';

class CommentOptionsMenu extends StatelessWidget {
  final Comment comment;
  final int? currentUserId;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const CommentOptionsMenu({
    super.key,
    required this.comment,
    this.currentUserId,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    // Vérifier si l'utilisateur peut modifier/supprimer ce commentaire
    final canModify = currentUserId != null && currentUserId == comment.idPerson;
    
    if (!canModify) {
      return const SizedBox.shrink();
    }

    return PopupMenuButton<String>(
      icon: Icon(
        Icons.more_vert,
        color: Colors.grey[600],
        size: 20,
      ),
      onSelected: (value) {
        switch (value) {
          case 'edit':
            onEdit?.call();
            break;
          case 'delete':
            _showDeleteConfirmation(context);
            break;
        }
      },
      itemBuilder: (context) => [
        PopupMenuItem(
          value: 'edit',
          child: Row(
            children: [
              Icon(Icons.edit, size: 18, color: Colors.blue[600]),
              const SizedBox(width: 8),
              const Text('Modifier'),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              Icon(Icons.delete, size: 18, color: Colors.red[600]),
              const SizedBox(width: 8),
              const Text('Supprimer'),
            ],
          ),
        ),
      ],
    );
  }

  void _showDeleteConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le commentaire'),
        content: const Text(
          'Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              onDelete?.call();
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
  }
} 