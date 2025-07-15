import 'dart:io';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import 'package:flutter/foundation.dart';

class PlantClassificationService {
  static const String _modelPath = 'assets/models/model_existing_tfselect.tflite';
  static const int _inputSize = 224; // Taille d'entrée standard pour les modèles de classification d'images
  
  // Classes de plantes supportées par le modèle
  // IMPORTANT: Ordre exact utilisé lors de l'entraînement Python
  // classes = ['Ficus-lyrata', 'Lavande', 'Monstera-deliciosa', 'Orchid']
  static const List<String> _plantClasses = [
    'Ficus Lyrata',       // Index 0 - Ficus-lyrata
    'Lavande',            // Index 1 - Lavande
    'Monstera Deliciosa', // Index 2 - Monstera-deliciosa
    'Orchidée',           // Index 3 - Orchid
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
      
      // Redimensionner l'image à la taille attendue par le modèle avec interpolation
      final resizedImage = img.copyResize(
        image, 
        width: _inputSize, 
        height: _inputSize,
        interpolation: img.Interpolation.linear
      );
      
      debugPrint('🖼️ Image redimensionnée: ${resizedImage.width}x${resizedImage.height}');
      
      // Convertir en tensor d'entrée avec le bon format
      final input = _imageToFloat32List(resizedImage);
      
      // Préparer le tensor de sortie de manière plus robuste
      final output = List.generate(1, (index) => List.filled(_plantClasses.length, 0.0));
      
      // Déboguer les dimensions
      debugPrint('🔍 Input shape: [1, $_inputSize, $_inputSize, 3]');
      debugPrint('🔍 Output shape: [1, ${_plantClasses.length}]');
      
      // Exécuter l'inférence
      _interpreter!.run(input, output);
      
      // Traiter les résultats
      final predictions = output[0] as List<double>;
      
      // Debug: Afficher toutes les prédictions
      debugPrint('🔍 Prédictions brutes:');
      for (int i = 0; i < predictions.length; i++) {
        debugPrint('   ${_plantClasses[i]}: ${predictions[i].toStringAsFixed(4)} (${(predictions[i] * 100).toStringAsFixed(1)}%)');
      }
      
      // Trouver la classe avec la plus haute probabilité
      double maxConfidence = 0.0;
      int maxIndex = 0;
      
      for (int i = 0; i < predictions.length; i++) {
        if (predictions[i] > maxConfidence) {
          maxConfidence = predictions[i];
          maxIndex = i;
        }
      }
      
      debugPrint('✅ Prédiction finale: ${_plantClasses[maxIndex]} (${(maxConfidence * 100).toStringAsFixed(1)}%)');
      
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
  List<List<List<List<double>>>> _imageToFloat32List(img.Image image) {
    // Créer un tensor 4D: [batch, height, width, channels]
    final input = List.generate(1, (b) => 
      List.generate(_inputSize, (h) => 
        List.generate(_inputSize, (w) => 
          List.generate(3, (c) => 0.0)
        )
      )
    );
    
    // Statistiques pour debugging
    double minVal = double.infinity;
    double maxVal = double.negativeInfinity;
    double sumVal = 0.0;
    int pixelCount = 0;
    
    for (int y = 0; y < _inputSize; y++) {
      for (int x = 0; x < _inputSize; x++) {
        final pixel = image.getPixel(x, y);
        
        // Extraire les composants RGB avec la nouvelle API
        final r = pixel.r;
        final g = pixel.g;
        final b = pixel.b;
        
        // Normalisation basée sur le type configuré
        double rNorm, gNorm, bNorm;
        
        switch (_normalizationType) {
          case 'standard':
            // Option 1: Normalisation [0, 1] (standard)
            rNorm = r / 255.0;
            gNorm = g / 255.0;
            bNorm = b / 255.0;
            break;
          
          case 'tanh':
            // Option 2: Normalisation [-1, 1] (utilisée par certains modèles)
            rNorm = (r / 255.0) * 2.0 - 1.0;
            gNorm = (g / 255.0) * 2.0 - 1.0;
            bNorm = (b / 255.0) * 2.0 - 1.0;
            break;
          
          case 'imagenet':
            // Option 3: Normalisation ImageNet (moyennes et écarts-types)
            rNorm = (r / 255.0 - 0.485) / 0.229;
            gNorm = (g / 255.0 - 0.456) / 0.224;
            bNorm = (b / 255.0 - 0.406) / 0.225;
            break;
          
          default:
            rNorm = r / 255.0;
            gNorm = g / 255.0;
            bNorm = b / 255.0;
        }
        
        input[0][y][x][0] = rNorm;
        input[0][y][x][1] = gNorm;
        input[0][y][x][2] = bNorm;
        
        // Statistiques
        minVal = [minVal, rNorm, gNorm, bNorm].reduce((a, b) => a < b ? a : b);
        maxVal = [maxVal, rNorm, gNorm, bNorm].reduce((a, b) => a > b ? a : b);
        sumVal += rNorm + gNorm + bNorm;
        pixelCount += 3;
      }
    }
    
    // Debug: Afficher les statistiques de l'image
    debugPrint('📊 Statistiques de l\'image (normalisation: $_normalizationType):');
    debugPrint('   Min: ${minVal.toStringAsFixed(4)}');
    debugPrint('   Max: ${maxVal.toStringAsFixed(4)}');
    debugPrint('   Moyenne: ${(sumVal / pixelCount).toStringAsFixed(4)}');
    
    return input;
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
  
  /// Utilitaire pour tester différentes normalisations
  /// Normalisation utilisée lors de l'entraînement : rescale=1./255
  static const String _normalizationType = 'standard'; // 'standard', 'tanh', 'imagenet'
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