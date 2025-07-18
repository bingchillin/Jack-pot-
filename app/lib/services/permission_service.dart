import 'dart:io';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'crashlytics_service.dart';
import 'package:image_picker/image_picker.dart';

class PermissionService {
  
  /// Vérifier et demander les permissions pour l'image picker
  static Future<bool> requestImagePickerPermissions(
    BuildContext context,
    ImageSource source,
  ) async {
    if (source == ImageSource.camera) {
      return await _requestCameraPermission(context);
    } else {
      return await _requestGalleryPermission(context);
    }
  }

  /// Demander la permission pour la caméra
  static Future<bool> _requestCameraPermission(BuildContext context) async {
    var status = await Permission.camera.status;

    if (status.isGranted) {
      return true;
    }

    if (status.isDenied) {
      // Expliquer pourquoi on a besoin de la permission
      bool shouldRequest = await _showPermissionExplanationDialog(
        context,
        'Accès à l\'appareil photo',
        'Pour prendre des photos et les ajouter à vos commentaires, nous avons besoin d\'accéder à votre appareil photo.',
        'Autoriser l\'appareil photo',
      );

      if (!shouldRequest) return false;

      status = await Permission.camera.request();
    }

    if (status.isPermanentlyDenied) {
      _showPermanentlyDeniedDialog(context, 'appareil photo');
      return false;
    }

    return status.isGranted;
  }

  /// Demander la permission pour la galerie
  static Future<bool> _requestGalleryPermission(BuildContext context) async {
    if (Platform.isAndroid) {
      // Android: gérer les différentes versions d'API
      
      // Essayer d'abord avec la nouvelle permission pour Android 13+
      try {
        var photosStatus = await Permission.photos.status;
        
        if (photosStatus.isGranted) {
          return true;
        }
        
        if (photosStatus.isDenied) {
          bool shouldRequest = await _showPermissionExplanationDialog(
            context,
            'Accès à la galerie',
            'Pour sélectionner des images de votre galerie et les ajouter à vos commentaires, nous avons besoin d\'accéder à vos photos.',
            'Autoriser la galerie',
          );

          if (!shouldRequest) return false;

          photosStatus = await Permission.photos.request();
          
          if (photosStatus.isGranted) {
            return true;
          }
        }
        
        if (photosStatus.isPermanentlyDenied) {
          _showPermanentlyDeniedDialog(context, 'galerie');
          return false;
        }
      } catch (e) {
        await CrashlyticsService().recordError(
          e,
          StackTrace.current,
          reason: 'Error with photos permission',
          fatal: false,
        );
      }
      
      // Fallback vers l'ancienne permission storage pour Android < 13
      try {
        var storageStatus = await Permission.storage.status;
        
        if (storageStatus.isGranted) {
          return true;
        }
        
        if (storageStatus.isDenied) {
          // Ne pas redemander l'explication si on l'a déjà fait
          storageStatus = await Permission.storage.request();
          
          if (storageStatus.isGranted) {
            return true;
          }
        }
        
        if (storageStatus.isPermanentlyDenied) {
          _showPermanentlyDeniedDialog(context, 'galerie');
          return false;
        }
      } catch (e) {
        await CrashlyticsService().recordError(
          e,
          StackTrace.current,
          reason: 'Error with storage permission',
          fatal: false,
        );
      }
      
      return false;
    } else {
      // iOS
      var status = await Permission.photos.status;

      if (status.isGranted) {
        return true;
      }

      if (status.isDenied) {
        bool shouldRequest = await _showPermissionExplanationDialog(
          context,
          'Accès à la galerie',
          'Pour sélectionner des images de votre galerie et les ajouter à vos commentaires, nous avons besoin d\'accéder à vos photos.',
          'Autoriser la galerie',
        );

        if (!shouldRequest) return false;

        status = await Permission.photos.request();
      }

      if (status.isPermanentlyDenied) {
        _showPermanentlyDeniedDialog(context, 'galerie');
        return false;
      }

      return status.isGranted;
    }
  }

  /// Afficher le dialog d'explication avant de demander la permission
  static Future<bool> _showPermissionExplanationDialog(
    BuildContext context,
    String title,
    String content,
    String buttonText,
  ) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Non merci'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: Colors.blue,
            ),
            child: Text(buttonText, style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    ) ?? false;
  }

  /// Afficher le dialog quand la permission est refusée définitivement
  static void _showPermanentlyDeniedDialog(BuildContext context, String permissionType) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Permission refusée'),
        content: Text(
          'L\'accès à la $permissionType a été refusé définitivement. '
          'Pour utiliser cette fonctionnalité, veuillez autoriser l\'accès dans les paramètres de l\'application.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              openAppSettings();
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.blue,
            ),
            child: const Text('Ouvrir les paramètres', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  /// Vérifier le statut d'une permission spécifique
  static Future<PermissionStatus> checkPermissionStatus(Permission permission) async {
    return await permission.status;
  }

  /// Ouvrir les paramètres de l'application
  static Future<void> openSettings() async {
    await openAppSettings();
  }

  /// Afficher des informations détaillées sur les permissions
  static String getPermissionExplanation(Permission permission) {
    switch (permission) {
      case Permission.camera:
        return 'L\'accès à l\'appareil photo permet de prendre des photos directement depuis l\'application.';
      case Permission.photos:
        return 'L\'accès à la galerie permet de sélectionner des images existantes sur votre appareil.';
      case Permission.storage:
        return 'L\'accès au stockage permet de lire et écrire des fichiers sur votre appareil.';
      default:
        return 'Cette permission est nécessaire pour le bon fonctionnement de l\'application.';
    }
  }
} 