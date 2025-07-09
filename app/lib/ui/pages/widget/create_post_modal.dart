import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/upload_service.dart';
import '../../widgets/simple_image_picker_widget.dart';
import '../../widgets/tag_selector_widget.dart';

class CreatePostModal extends StatefulWidget {
  const CreatePostModal({Key? key}) : super(key: key);

  @override
  State<CreatePostModal> createState() => _CreatePostModalState();
}

class _CreatePostModalState extends State<CreatePostModal> {
  final TextEditingController _controller = TextEditingController();
  bool _isSubmitting = false;
  File? _selectedImage;
  bool _isUploadingImage = false;
  String? _selectedTag;

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
    return BlocListener<CommentBloc, CommentState>(
      listener: (context, state) {
        if (state is CommentCreated) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Post publié !')),
          );
        } else if (state is CommentError) {
          setState(() {
            _isSubmitting = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur: ${state.message}')),
          );
        }
      },
      child: Container(
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
                      'Nouveau post',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: (_isSubmitting || _isUploadingImage) ? null : _submitPost,
                    child: (_isSubmitting || _isUploadingImage)
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(
                          'Publier',
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
                          child: Icon(Icons.person, color: Colors.white),
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Partagez votre expérience...',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Sélecteur de tag
                    TagSelectorWidget(
                      selectedTag: _selectedTag,
                      onTagSelected: (tag) {
                        setState(() {
                          _selectedTag = tag;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        maxLines: null,
                        expands: true,
                        textAlignVertical: TextAlignVertical.top,
                        decoration: const InputDecoration(
                          hintText: 'Que souhaitez-vous partager avec la communauté ?\n\nConseils, questions, expériences...',
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
                    // Widget de sélection d'image (avec fallback)
                    SimpleImagePickerWidget(
                      onImageSelected: (File? image) {
                        setState(() {
                          _selectedImage = image;
                        });
                      },
                      initialImage: _selectedImage,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _isUserAuthenticated(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return authProvider.isAuthenticated;
  }

  void _showAuthRequiredSnackBar(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Connectez-vous pour créer un post'),
        backgroundColor: Colors.orange,
        action: SnackBarAction(
          label: 'Se connecter',
          textColor: Colors.white,
          onPressed: (){
            Navigator.pushNamed(context, '/login');
          },
        ),
      ),
    );
  }

  void _submitPost() async {
    if (!_isUserAuthenticated(context)) {
      _showAuthRequiredSnackBar(context);
      return;
    }

    final content = _controller.text.trim();
    if (content.isEmpty && _selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez écrire quelque chose ou ajouter une image')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      String? imageUrl;
      
      // Upload de l'image si sélectionnée
      if (_selectedImage != null) {
        setState(() {
          _isUploadingImage = true;
        });
        
        final uploadService = UploadService();
        imageUrl = await uploadService.uploadImage(
          _selectedImage!,
          token: authProvider.accessToken,
        );
        
        setState(() {
          _isUploadingImage = false;
        });
      }

      // Créer le commentaire avec ou sans image et avec le tag sélectionné
      context.read<CommentBloc>().add(
        CreateComment(
          content,
          imageUrl: imageUrl,
          tag: _selectedTag,
          userId: authProvider.currentUser!.idPerson.toString(),
        ),
      );
    } catch (e) {
      setState(() {
        _isSubmitting = false;
        _isUploadingImage = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de l\'upload: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
} 