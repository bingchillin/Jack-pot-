import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../../../bloc/comment/comment_event.dart';
import '../../../models/comment_model.dart';

class EditCommentModal extends StatefulWidget {
  final Comment comment;

  const EditCommentModal({
    Key? key,
    required this.comment,
  }) : super(key: key);

  @override
  State<EditCommentModal> createState() => _EditCommentModalState();
}

class _EditCommentModalState extends State<EditCommentModal> {
  final TextEditingController _controller = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _controller.text = widget.comment.content;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.6,
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
                    'Modifier le commentaire',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: _isSubmitting ? null : _submitEdit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(
                          'Modifier',
                          style: TextStyle(
                            color: Colors.blue,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ],
            ),
          ),
          // Zone de saisie
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.blue,
                        child: Icon(Icons.edit, color: Colors.white),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Modifiez votre commentaire',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      maxLines: null,
                      expands: true,
                      textAlignVertical: TextAlignVertical.top,
                      decoration: const InputDecoration(
                        hintText: 'Modifiez votre commentaire...',
                        border: InputBorder.none,
                        hintStyle: TextStyle(
                          color: Colors.grey,
                          fontSize: 16,
                          height: 1.5,
                        ),
                      ),
                      style: const TextStyle(fontSize: 16, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _submitEdit() async {
    final content = _controller.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez écrire quelque chose')),
      );
      return;
    }

    if (content == widget.comment.content) {
      Navigator.pop(context);
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      context.read<CommentBloc>().add(
        UpdateComment(
          commentId: widget.comment.idComment,
          content: content,
        ),
      );

      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Commentaire modifié !')),
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