import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class SimpleImagePickerWidget extends StatefulWidget {
  final Function(File?) onImageSelected;
  final File? initialImage;

  const SimpleImagePickerWidget({
    Key? key,
    required this.onImageSelected,
    this.initialImage,
  }) : super(key: key);

  @override
  State<SimpleImagePickerWidget> createState() => _SimpleImagePickerWidgetState();
}

class _SimpleImagePickerWidgetState extends State<SimpleImagePickerWidget> {
  File? _selectedImage;

  @override
  void initState() {
    super.initState();
    _selectedImage = widget.initialImage;
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (image != null) {
        final File imageFile = File(image.path);
        setState(() {
          _selectedImage = imageFile;
        });
        widget.onImageSelected(imageFile);
      }
    } catch (e) {
      print('Error picking image: $e');
      
      // Afficher un dialog d'erreur avec des solutions
      if (mounted) {
        _showErrorDialog(e.toString());
      }
    }
  }

  void _showErrorDialog(String error) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Erreur de sélection d\'image'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Impossible de sélectionner l\'image :\n$error'),
            const SizedBox(height: 16),
            const Text('Solutions possibles :'),
            const SizedBox(height: 8),
            const Text('• Redémarrer l\'application'),
            const Text('• Redémarrer l\'émulateur (Cold Boot)'),
            const Text('• Vérifier les permissions dans les paramètres'),
            const Text('• Essayer avec un appareil physique'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fermer'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Réessayer après un délai
              Future.delayed(const Duration(seconds: 1), () {
                _showImageSourceDialog();
              });
            },
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Permissions requises'),
        content: const Text(
          'Cette application a besoin d\'accéder à votre appareil photo et à votre galerie pour fonctionner correctement.\n\n'
          'Veuillez aller dans les paramètres de votre téléphone et autoriser l\'accès à l\'appareil photo et aux photos.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('D\'accord'),
          ),
        ],
      ),
    );
  }

  void _removeImage() {
    setState(() {
      _selectedImage = null;
    });
    widget.onImageSelected(null);
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Prendre une photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choisir depuis la galerie'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Bouton pour ajouter une image
        Row(
          children: [
            IconButton(
              onPressed: _showImageSourceDialog,
              icon: Icon(
                Icons.image,
                color: Colors.blue.shade600,
              ),
              tooltip: 'Ajouter une image',
            ),
            if (_selectedImage != null) ...[
              const SizedBox(width: 8),
              Text(
                'Image sélectionnée',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                ),
              ),
              IconButton(
                onPressed: _removeImage,
                icon: Icon(
                  Icons.close,
                  color: Colors.red.shade600,
                  size: 20,
                ),
                tooltip: 'Supprimer l\'image',
              ),
            ],
          ],
        ),
        
        // Aperçu de l'image sélectionnée
        if (_selectedImage != null) ...[
          const SizedBox(height: 8),
          Container(
            constraints: const BoxConstraints(
              maxHeight: 200,
              maxWidth: double.infinity,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Stack(
                children: [
                  Image.file(
                    _selectedImage!,
                    fit: BoxFit.cover,
                    width: double.infinity,
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: _removeImage,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.close,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
} 