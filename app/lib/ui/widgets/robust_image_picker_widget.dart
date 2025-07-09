import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class RobustImagePickerWidget extends StatefulWidget {
  final Function(File?) onImageSelected;
  final File? initialImage;

  const RobustImagePickerWidget({
    Key? key,
    required this.onImageSelected,
    this.initialImage,
  }) : super(key: key);

  @override
  State<RobustImagePickerWidget> createState() => _RobustImagePickerWidgetState();
}

class _RobustImagePickerWidgetState extends State<RobustImagePickerWidget> {
  File? _selectedImage;
  static const MethodChannel _channel = MethodChannel('robust_image_picker');

  @override
  void initState() {
    super.initState();
    _selectedImage = widget.initialImage;
  }

  Future<void> _pickImageFromGallery() async {
    try {
      const MethodChannel _channel = MethodChannel('plugins.flutter.io/image_picker');
      
      final result = await _channel.invokeMethod('pickImage', {
        'source': 1, // 1 = gallery, 0 = camera
        'maxWidth': 1920.0,
        'maxHeight': 1920.0,
        'imageQuality': 85,
      });

      if (result != null && result['path'] != null) {
        final File imageFile = File(result['path']);
        setState(() {
          _selectedImage = imageFile;
        });
        widget.onImageSelected(imageFile);
      }
    } catch (e) {
      print('Gallery error: $e');
      _showFallbackDialog('galerie');
    }
  }

  Future<void> _pickImageFromCamera() async {
    try {
      const MethodChannel _channel = MethodChannel('plugins.flutter.io/image_picker');
      
      final result = await _channel.invokeMethod('pickImage', {
        'source': 0, // 0 = camera, 1 = gallery
        'maxWidth': 1920.0,
        'maxHeight': 1920.0,
        'imageQuality': 85,
      });

      if (result != null && result['path'] != null) {
        final File imageFile = File(result['path']);
        setState(() {
          _selectedImage = imageFile;
        });
        widget.onImageSelected(imageFile);
      }
    } catch (e) {
      print('Camera error: $e');
      _showFallbackDialog('appareil photo');
    }
  }

  void _showFallbackDialog(String source) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Problème d\'accès à la $source'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Impossible d\'accéder à la $source.'),
            const SizedBox(height: 16),
            const Text('Solutions possibles :'),
            const SizedBox(height: 8),
            const Text('• Redémarrer l\'application'),
            const Text('• Vérifier les permissions dans les paramètres'),
            Text('• Activer l\'accès à la $source pour cette app'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fermer'),
          ),
          if (source == 'galerie')
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _showAlternativePickerDialog();
              },
              child: const Text('Essayer autrement'),
            ),
        ],
      ),
    );
  }

  void _showAlternativePickerDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sélection alternative'),
        content: const Text(
          'Vous pouvez aller dans les paramètres de votre téléphone et autoriser manuellement l\'accès à l\'appareil photo et à la galerie pour cette application.',
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
              subtitle: const Text('Utiliser l\'appareil photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImageFromCamera();
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choisir depuis la galerie'),
              subtitle: const Text('Sélectionner une photo existante'),
              onTap: () {
                Navigator.pop(context);
                _pickImageFromGallery();
              },
            ),
            ListTile(
              leading: const Icon(Icons.cancel),
              title: const Text('Annuler'),
              onTap: () => Navigator.pop(context),
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
                Icons.add_photo_alternate,
                color: Colors.blue.shade600,
                size: 28,
              ),
              tooltip: 'Ajouter une image',
            ),
            if (_selectedImage != null) ...[
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Image sélectionnée',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                  ),
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
            ] else ...[
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Appuyez pour ajouter une image',
                  style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 14,
                  ),
                ),
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
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 200,
                        color: Colors.grey.shade100,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error,
                              size: 48,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Erreur de chargement',
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
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