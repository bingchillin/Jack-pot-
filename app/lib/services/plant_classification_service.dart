import 'dart:io';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import 'package:flutter/foundation.dart';

class PlantClassificationService {
  static const String _modelPath = 'assets/models/model_existing_tfselect.tflite';
  static const int _inputSize = 224; // Taille d'entrée standard pour les modèles de classification d'images
  
  // Classes de plantes supportées par le modèle
  static const List<String> _plantClasses = [
    'Orchidée',
    'Ficus Lyrata',
    'Lavande',
    'Monstera Deliciosa',
  ];
  
  Interpreter? _interpreter;
  bool _isModelLoaded = false;
  
  /// Initialise le modèle TensorFlow Lite
  Future<void> initModel() async {
    try {
      // Charger le modèle depuis les assets
      _interpreter = await Interpreter.fromAsset(_modelPath);
      _isModelLoaded = true;
      debugPrint('✅ Modèle TensorFlow Lite chargé avec succès');
      
      // Afficher des informations sur le modèle
      debugPrint('📊 Modèle chargé: $_modelPath');
      debugPrint('🔢 Classes supportées: ${_plantClasses.length}');
    } catch (e) {
      debugPrint('❌ Erreur lors du chargement du modèle: $e');
      _isModelLoaded = false;
      rethrow;
    }
  }
  
  /// Classifie une image de plante
  Future<PlantClassificationResult> classifyImage(String imagePath) async {
    if (!_isModelLoaded || _interpreter == null) {
      throw Exception('Le modèle n\'est pas chargé. Appelez initModel() d\'abord.');
    }
    
    try {
      // Lire et préprocesser l'image
      final imageBytes = await File(imagePath).readAsBytes();
      final image = img.decodeImage(imageBytes);
      
      if (image == null) {
        throw Exception('Impossible de décoder l\'image');
      }
      
      // Redimensionner l'image à la taille attendue par le modèle
      final resizedImage = img.copyResize(image, width: _inputSize, height: _inputSize);
      
      // Convertir en tensor d'entrée
      final input = _imageToByteListFloat32(resizedImage);
      
      // Préparer le tensor de sortie
      final output = List.filled(_plantClasses.length, 0.0).reshape([1, _plantClasses.length]);
      
      // Exécuter l'inférence
      _interpreter!.run(input, output);
      
      // Traiter les résultats
      final predictions = output[0] as List<double>;
      
      // Trouver la classe avec la plus haute probabilité
      double maxConfidence = 0.0;
      int maxIndex = 0;
      
      for (int i = 0; i < predictions.length; i++) {
        if (predictions[i] > maxConfidence) {
          maxConfidence = predictions[i];
          maxIndex = i;
        }
      }
      
      // Créer le résultat avec toutes les prédictions
      final List<PlantPrediction> allPredictions = [];
      for (int i = 0; i < _plantClasses.length; i++) {
        allPredictions.add(PlantPrediction(
          plantName: _plantClasses[i],
          confidence: predictions[i],
        ));
      }
      
      // Trier par confiance décroissante
      allPredictions.sort((a, b) => b.confidence.compareTo(a.confidence));
      
      return PlantClassificationResult(
        predictedPlant: _plantClasses[maxIndex],
        confidence: maxConfidence,
        allPredictions: allPredictions,
      );
      
    } catch (e) {
      debugPrint('❌ Erreur lors de la classification: $e');
      rethrow;
    }
  }
  
  /// Convertit une image en tensor Float32 pour TensorFlow Lite
  Uint8List _imageToByteListFloat32(img.Image image) {
    final buffer = Float32List(_inputSize * _inputSize * 3);
    int pixelIndex = 0;
    
    for (int y = 0; y < _inputSize; y++) {
      for (int x = 0; x < _inputSize; x++) {
        final pixel = image.getPixel(x, y);
        
        // Extraire les composants RGB avec la nouvelle API
        final r = pixel.r;
        final g = pixel.g;
        final b = pixel.b;
        
        // Normaliser les valeurs RGB de [0, 255] à [0, 1]
        buffer[pixelIndex++] = r / 255.0;
        buffer[pixelIndex++] = g / 255.0;
        buffer[pixelIndex++] = b / 255.0;
      }
    }
    
    return buffer.buffer.asUint8List();
  }
  
  /// Libère les ressources
  void dispose() {
    _interpreter?.close();
    _interpreter = null;
    _isModelLoaded = false;
  }
  
  /// Retourne true si le modèle est chargé
  bool get isModelLoaded => _isModelLoaded;
  
  /// Retourne la liste des classes de plantes supportées
  List<String> get supportedPlants => List.from(_plantClasses);
}

/// Résultat de la classification d'une plante
class PlantClassificationResult {
  final String predictedPlant;
  final double confidence;
  final List<PlantPrediction> allPredictions;
  
  PlantClassificationResult({
    required this.predictedPlant,
    required this.confidence,
    required this.allPredictions,
  });
  
  /// Retourne true si la prédiction est fiable (confiance > 0.5)
  bool get isConfident => confidence > 0.5;
  
  /// Retourne le pourcentage de confiance
  int get confidencePercentage => (confidence * 100).round();
  
  @override
  String toString() {
    return 'PlantClassificationResult(plant: $predictedPlant, confidence: $confidencePercentage%)';
  }
}

/// Prédiction individuelle pour une classe de plante
class PlantPrediction {
  final String plantName;
  final double confidence;
  
  PlantPrediction({
    required this.plantName,
    required this.confidence,
  });
  
  int get confidencePercentage => (confidence * 100).round();
  
  @override
  String toString() {
    return 'PlantPrediction(plant: $plantName, confidence: $confidencePercentage%)';
  }
} 