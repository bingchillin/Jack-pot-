import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../services/plant_classification_service.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';

class PlantClassifierPage extends StatefulWidget {
  const PlantClassifierPage({super.key});

  @override
  State<PlantClassifierPage> createState() => _PlantClassifierPageState();
}

class _PlantClassifierPageState extends State<PlantClassifierPage> with TickerProviderStateMixin {
  final PlantClassificationService _classificationService = PlantClassificationService();
  final ImagePicker _picker = ImagePicker();
  
  File? _selectedImage;
  PlantClassificationResult? _classificationResult;
  bool _isLoading = false;
  bool _isModelLoaded = false;
  String? _error;
  
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut)
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic));
    
    _initializeModel();
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    _classificationService.dispose();
    super.dispose();
  }
  
  Future<void> _initializeModel() async {
    try {
      await _classificationService.initModel();
      setState(() {
        _isModelLoaded = true;
      });
      _animationController.forward();
    } catch (e) {
      setState(() {
        _error = 'Erreur lors du chargement du modèle: $e';
      });
    }
  }
  
  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );
      
      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _classificationResult = null;
          _error = null;
        });
        
        // Classifier automatiquement l'image
        await _classifyImage();
      }
    } catch (e) {
      setState(() {
        _error = 'Erreur lors de la sélection de l\'image: $e';
      });
    }
  }
  
  Future<void> _classifyImage() async {
    if (_selectedImage == null || !_isModelLoaded) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });
    
    try {
      final result = await _classificationService.classifyImage(_selectedImage!.path);
      setState(() {
        _classificationResult = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Erreur lors de la classification: $e';
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context);
    
    return Scaffold(
      backgroundColor: Colors.green[50],
      appBar: AppBar(
        title: Text(
          'Classification de Plantes',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        backgroundColor: Colors.green[50],
        surfaceTintColor: Colors.green[50],
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.grey[800]),
      ),
      body: _isModelLoaded ? _buildContent(context, localizations, authProvider) : _buildLoading(),
    );
  }
  
  Widget _buildLoading() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: Colors.green),
          SizedBox(height: 16),
          Text('Chargement du modèle...'),
        ],
      ),
    );
  }
  
  Widget _buildContent(BuildContext context, AppLocalizations localizations, AuthProvider authProvider) {
    if (_error != null) {
      return _buildError();
    }
    
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildImageSection(),
              const SizedBox(height: 24),
              _buildActionButtons(),
              if (_classificationResult != null) ...[
                const SizedBox(height: 32),
                _buildResultsSection(),
              ],
              if (_isLoading) ...[
                const SizedBox(height: 32),
                _buildLoadingSection(),
              ],
              const SizedBox(height: 100), // Espace pour éviter le débordement
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(
            Icons.camera_alt,
            size: 48,
            color: Colors.green[600],
          ),
          const SizedBox(height: 16),
          Text(
            'Identifiez votre plante',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.grey[800],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Prenez une photo pour identifier automatiquement votre plante parmi :\nOrchidée, Ficus Lyrata, Lavande, Monstera Deliciosa',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
  
  Widget _buildImageSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: _selectedImage != null
            ? Image.file(
                _selectedImage!,
                height: 300,
                width: double.infinity,
                fit: BoxFit.cover,
              )
            : Container(
                height: 300,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.add_photo_alternate,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Aucune image sélectionnée',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
  
  Widget _buildActionButtons() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () => _pickImage(ImageSource.camera),
        icon: const Icon(Icons.camera_alt),
        label: const Text('Prendre une photo'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green[600],
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
  
  Widget _buildLoadingSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          CircularProgressIndicator(
            color: Colors.green[600],
          ),
          const SizedBox(height: 16),
          Text(
            'Analyse en cours...',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Identification de votre plante',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildResultsSection() {
    if (_classificationResult == null) return const SizedBox();
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.eco,
                color: Colors.green[600],
                size: 28,
              ),
              const SizedBox(width: 12),
              Text(
                'Résultat de l\'identification',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Prédiction principale
          _buildMainPrediction(),
          
          const SizedBox(height: 20),
          
          // Toutes les prédictions
          Text(
            'Toutes les prédictions:',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 12),
          
          ...(_classificationResult!.allPredictions.map((prediction) => 
            _buildPredictionItem(prediction)
          ).toList()),
        ],
      ),
    );
  }
  
  Widget _buildMainPrediction() {
    final result = _classificationResult!;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: result.isConfident ? Colors.green[50] : Colors.orange[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: result.isConfident ? Colors.green[200]! : Colors.orange[200]!,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            result.isConfident ? Icons.check_circle : Icons.warning,
            color: result.isConfident ? Colors.green[600] : Colors.orange[600],
            size: 32,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  result.predictedPlant,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${result.confidencePercentage}% de confiance',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                if (!result.isConfident) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Prédiction peu fiable',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.orange[600],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildPredictionItem(PlantPrediction prediction) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              prediction.plantName,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
              ),
            ),
          ),
          SizedBox(
            width: 100,
            child: LinearProgressIndicator(
              value: prediction.confidence,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(
                prediction.confidence > 0.5 ? Colors.green[600]! : Colors.orange[600]!,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '${prediction.confidencePercentage}%',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildError() {
    return Center(
      child: Container(
        margin: const EdgeInsets.all(24),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.red[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.red[200]!),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Colors.red[600],
            ),
            const SizedBox(height: 16),
            Text(
              'Erreur',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.red[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(
                fontSize: 14,
                color: Colors.red[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _error = null;
                });
                _initializeModel();
              },
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }
} 