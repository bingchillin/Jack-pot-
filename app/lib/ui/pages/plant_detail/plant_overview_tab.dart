import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../models/avatar.dart';
import '../../../models/object_profile.dart';
import '../../../app_config.dart';
import '../../../l10n/app_localizations.dart';
import '../../../services/automatic_score_service.dart';
import '../../../services/plant_care_score_service.dart';
import '../../../services/score_popup_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/plant_care_score.dart';
import '../widget/plant_card_favorite/plant_control_switches_widget.dart';

class PlantOverviewTab extends StatefulWidget {
  final ObjectProfile plant;

  const PlantOverviewTab({Key? key, required this.plant}) : super(key: key);

  @override
  State<PlantOverviewTab> createState() => _PlantOverviewTabState();
}

class _PlantOverviewTabState extends State<PlantOverviewTab> {
  PlantCareScore? _calculatedScore;

  String _getStateText(AppLocalizations localizations, int? state) {
    switch (state) {
      case 1:
        return localizations.stateExcellent;
      case 2:
        return localizations.stateGood;
      case 3:
        return localizations.stateFair;
      case 4:
        return localizations.stateNeedsAttention;
      case 5:
        return localizations.stateCritical;
      default:
        return localizations.stateUnknown;
    }
  }

  Color _getStateColor(int? state) {
    switch (state) {
      case 1:
        return Colors.green[600]!;
      case 2:
        return Colors.green[500]!;
      case 3:
        return Colors.orange[500]!;
      case 4:
        return Colors.orange[600]!;
      case 5:
        return Colors.red[600]!;
      default:
        return Colors.grey[500]!;
    }
  }

  IconData _getStateIcon(int? state) {
    switch (state) {
      case 1:
        return Icons.check_circle;
      case 2:
        return Icons.check_circle_outline;
      case 3:
        return Icons.warning_amber;
      case 4:
        return Icons.warning;
      case 5:
        return Icons.error;
      default:
        return Icons.help_outline;
    }
  }

  int _getHealthScore() {
    switch (widget.plant.state) {
      case 1:
        return 95;
      case 2:
        return 85;
      case 3:
        return 70;
      case 4:
        return 50;
      case 5:
        return 20;
      default:
        return 0;
    }
  }

  Color _getHealthColor() {
    final score = _getHealthScore();
    if (score >= 80) return Colors.green[600]!;
    if (score >= 60) return Colors.green[500]!;
    if (score >= 40) return Colors.orange[500]!;
    return Colors.red[600]!;
  }

  @override
  void initState() {
    super.initState();
    _checkAndCalculateScore();
  }

  Future<void> _checkAndCalculateScore() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.accessToken;
      
      if (token == null) return;

      final autoScoreService = AutomaticScoreService(
        Provider.of<PlantCareScoreService>(context, listen: false),
      );

      // Check if we should calculate a score for today
      final shouldCalculate = await autoScoreService.shouldCalculateScore();
      
      if (shouldCalculate) {
        // Calculate the score
        final score = await autoScoreService.calculateAutomaticScore(
          widget.plant.idObjectProfile,
          token,
        );

        if (score != null) {
          // Score calculation completed - no popup shown here anymore
          // Popup is now shown from plant list pages
          
          setState(() {
            _calculatedScore = score;
          });
        }
      }
    } catch (e) {
      // Silent fail for automatic scoring
    }
  }

  void _testScorePopup() {
    // Create a mock score for testing
    final mockScore = PlantCareScore(
      idPlantCareScore: 0,
      idObjectProfile: widget.plant.idObjectProfile,
      scoreDate: DateTime.now(),
      dailyScore: 28, // High score for testing
      weeklyScore: 0,
      moistureScore: 10,
      temperatureScore: 8,
      lightScore: 6,
      phScore: 4,
      consistencyBonus: 2,
      improvementBonus: 0,
      dailyMessage: "Excellent! Your plant care is outstanding!",
      weeklyMessage: null,
      sensorData: {
        'moisture': 75.0,
        'temperature': 22.0,
        'light': 65.0,
        'ph': 6.5,
      },
      isPerfectDay: true,
      isPerfectWeek: false,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      currentStreak: 0,
    );

    // Mock score calculation completed - no popup shown here anymore
    // Popup is now shown from plant list pages
    
    setState(() {
      _calculatedScore = mockScore;
    });
  }

  Widget _buildTestScoreButton(AppLocalizations localizations) {
    return Column(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          child: ElevatedButton.icon(
            onPressed: _testScorePopup,
            icon: const Icon(Icons.play_arrow),
            label: Text('Test Score Popup'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[600],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 2,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          child: ElevatedButton.icon(
            onPressed: _resetAutomaticScoring,
            icon: const Icon(Icons.refresh),
            label: Text('Reset Auto-Scoring'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange[600],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 2,
            ),
          ),
        ),
      ],
    );
  }

  void _resetAutomaticScoring() async {
    final autoScoreService = AutomaticScoreService(
      Provider.of<PlantCareScoreService>(context, listen: false),
    );
    await autoScoreService.resetLastScoreDate();
    
    // Show a snackbar to confirm
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Automatic scoring reset! Next visit will trigger a new score calculation.'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final stateColor = _getStateColor(widget.plant.state);
    final healthScore = _getHealthScore();
    final healthColor = _getHealthColor();

    final avatars = widget.plant.plantType?.avatars;

    Avatar? avatar;

    if (avatars == null || avatars.isEmpty) {
      avatar = null;
    } else {
      try {
        avatar = avatars.firstWhere((a) => a.stateP == widget.plant.state);
      } catch (e) {
        try {
          avatar = avatars.firstWhere((a) => a.stateP == 0);
        } catch (e) {
          avatar = null;
        }
      }
    }

    final pathPicture = avatar?.pathPicture.toString();
    final imageUrl = pathPicture != null
        ? Uri.parse(AppConfig.baseUrlSrc).resolve(pathPicture).toString()
        : null;


    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plant Image Section with Floating Switches
          _buildSectionHeader(
            'Plant Image',
            Icons.photo,
            Colors.green[600]!,
          ),
          const SizedBox(height: 16),
          _buildImageCardWithSwitches(imageUrl, localizations),

          const SizedBox(height: 24),

          // Plant Health Section
          _buildSectionHeader(
            'Plant Health',
            Icons.favorite,
            Colors.red[600]!,
          ),
          const SizedBox(height: 16),
          _buildHealthCard(localizations, stateColor, healthScore, healthColor),

          const SizedBox(height: 24),

          // Test score button removed - moved to plants page

          const SizedBox(height: 40),
        ],
      ),
    );
  }



  Widget _buildSectionHeader(String title, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            color: color,
            size: 24,
          ),
        ),
        const SizedBox(width: 16),
        Text(
          title,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
      ],
    );
  }

  Widget _buildImageCardWithSwitches(String? imageUrl, AppLocalizations localizations) {
    return Container(
      height: 280,
      decoration: BoxDecoration(
        color: Colors.green[100],
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(
          color: Colors.green[200]!,
          width: 1.5,
        ),
      ),
      child: Stack(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: imageUrl != null
                ? Image.network(
                    imageUrl,
                    width: double.infinity,
                    height: double.infinity,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) {
                        return child;
                      }
                      return Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.green[100]!,
                              Colors.green[200]!,
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(
                                width: 32,
                                height: 32,
                                child: CircularProgressIndicator(
                                  value: loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                      : null,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.green[600]!),
                                  strokeWidth: 3,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Icon(
                                Icons.eco,
                                color: Colors.green[600],
                                size: 24,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                localizations.loading,
                                style: TextStyle(
                                  color: Colors.green[700],
                                  fontSize: 12,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(localizations.imageNotAvailable),
                  )
                : _buildImagePlaceholder(localizations.noImage),
          ),
          
          // Floating Control Switches
          Positioned(
            bottom: 12,
            left: 12,
            right: 12,
            child: PlantControlSwitches(plant: widget.plant),
          ),
        ],
      ),
    );
  }

  Widget _buildImagePlaceholder(String text) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.green[100]!,
            Colors.green[200]!,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.eco,
              color: Colors.green[600],
              size: 48,
            ),
            const SizedBox(height: 8),
            Text(
              text,
              style: TextStyle(
                color: Colors.green[700],
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthCard(AppLocalizations localizations, Color stateColor, int healthScore, Color healthColor) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(
          color: Colors.red[200]!,
          width: 1.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Health Information',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Current state and wellness score',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 20),
            
            // State Badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: stateColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: stateColor.withValues(alpha: 0.3),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getStateIcon(widget.plant.state),
                        size: 18,
                        color: stateColor,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _getStateText(localizations, widget.plant.state),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: stateColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: healthColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: healthColor.withValues(alpha: 0.3),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.favorite,
                        size: 18,
                        color: healthColor,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '$healthScore%',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: healthColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Health Progress Bar
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Health Score',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 8,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: healthScore / 100,
                    child: Container(
                      decoration: BoxDecoration(
                        color: healthColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}