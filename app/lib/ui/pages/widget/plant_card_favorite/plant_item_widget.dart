import 'package:flutter/material.dart';
import 'package:jackpote/ui/pages/widget/plant_card_favorite/plant_control_switches_widget.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../models/avatar.dart';
import '../../../../models/object_profile.dart';
import 'package:jackpote/app_config.dart';
import '../../plant_detail_page.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../widgets/improved_score_popup.dart';
import '../../../../services/automatic_score_service.dart';
import '../../../../services/plant_care_score_service.dart';
import '../../../../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class PlantItemWidget extends StatelessWidget {
  final ObjectProfile plant;
  final Function(bool)? onToggleAutomatic;
  final Function(bool)? onToggleWillWatering;

  PlantItemWidget({
    Key? key,
    required this.plant,
    this.onToggleAutomatic,
    this.onToggleWillWatering,
  }) : super(key: ValueKey(plant.idObjectProfile));

  Future<void> _showScorePopup(BuildContext context) async {
    try {
      // Check if popup is already showing
      if (ImprovedScorePopupService().isPopupShowing) {
        print('⚠️ Popup already showing, skipping plant item popup');
        return;
      }

      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.accessToken;
      
      if (token != null) {
        final scoreService = PlantCareScoreService();
        final autoScoreService = AutomaticScoreService(scoreService);
        final score = await autoScoreService.calculateAutomaticScore(
          plant.idObjectProfile,
          token,
        );

        if (score != null && context.mounted && !ImprovedScorePopupService().isPopupShowing) {
          ImprovedScorePopupService().showScorePopup(
            context: context,
            plant: plant,
            moistureScore: score.moistureScore,
            temperatureScore: score.temperatureScore,
            lightScore: score.lightScore,
            phScore: score.phScore,
            bonusScore: score.consistencyBonus,
            totalScore: score.dailyScore,
            plantIndex: null,
            totalPlants: null,
          );
        }
      } else {
        // Show mock data for guest users
        if (!ImprovedScorePopupService().isPopupShowing) {
          ImprovedScorePopupService().showScorePopup(
            context: context,
            plant: plant,
            moistureScore: 8,
            temperatureScore: 7,
            lightScore: 5,
            phScore: 3,
            bonusScore: 2,
            totalScore: 25,
            plantIndex: null,
            totalPlants: null,
          );
        }
      }
    } catch (e) {
      // Show mock data on error
      if (context.mounted && !ImprovedScorePopupService().isPopupShowing) {
        ImprovedScorePopupService().showScorePopup(
          context: context,
          plant: plant,
          moistureScore: 6,
          temperatureScore: 5,
          lightScore: 4,
          phScore: 2,
          bonusScore: 0,
          totalScore: 17,
          plantIndex: null,
          totalPlants: null,
        );
      }
    }
  }

  String _getStateText(int? state) {
    switch (state) {
      case 1:
        return 'Excellent';
      case 2:
        return 'Bon état';
      case 3:
        return 'Moyen';
      case 4:
        return 'Attention requise';
      case 5:
        return 'État critique';
      default:
        return 'État inconnu';
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

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final stateColor = _getStateColor(plant.state);

    final avatars = plant.plantType?.avatars;

    Avatar? avatar;

    if (avatars == null || avatars.isEmpty) {
      avatar = null;
    } else {
      try {
        avatar = avatars.firstWhere((a) => a.stateP == plant.state);
      } catch (e) {
        try {
          avatar = avatars.firstWhere((a) => a.stateP == 0);
        } catch (e) {
          avatar = null;
        }
      }
    }

    final pathPicture = avatar?.pathPicture.toString();

    return Container(
      height: 360,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PlantDetailPage(plantId: plant.idObjectProfile),
              ),
            );
          },
          borderRadius: BorderRadius.circular(24),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
              border: Border.all(
                color: stateColor.withValues(alpha: 0.2),
                width: 2,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Plant Image with Floating Switches
                Expanded(
                  flex: 5,
                  child: Stack(
                    children: [
                      // Image Container
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                          gradient: LinearGradient(
                            colors: [
                              Colors.green[50]!,
                              Colors.green[100]!,
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                          child: pathPicture != null
                              ? Image.network(
                                  Uri.parse(AppConfig.baseUrlSrc).resolve(pathPicture).toString(),
                                  fit: BoxFit.cover,
                                  loadingBuilder: (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return Shimmer.fromColors(
                                      baseColor: Colors.grey.shade300,
                                      highlightColor: Colors.grey.shade100,
                                      child: Container(
                                        width: double.infinity,
                                        height: double.infinity,
                                        color: Colors.white,
                                      ),
                                    );
                                  },
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.green[100]!,
                                          Colors.green[200]!,
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
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
                                            localizations.imageNotAvailable,
                                            style: TextStyle(
                                              color: Colors.green[700],
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              : Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.green[100]!,
                                        Colors.green[200]!,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
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
                                          localizations.noImage,
                                          style: TextStyle(
                                            color: Colors.green[700],
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                        ),
                      ),
                      
                      // Floating Control Switches
                      Positioned(
                        bottom: 12,
                        left: 12,
                        right: 12,
                        child: PlantControlSwitches(plant: plant),
                      ),
                    ],
                  ),
                ),
                
                // Plant Info (No switches here anymore)
                Expanded(
                  flex: 3,
                  child: Padding(
                    padding: const EdgeInsets.all(16), // Restored normal padding
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Plant Name
                        Text(
                          plant.title ?? localizations.unknownName,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18, // Restored larger font
                            color: Colors.grey[800],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4), // More spacing
                        
                        // Plant Type
                        Text(
                          plant.plantType?.title ?? localizations.unknownType,
                          style: TextStyle(
                            fontSize: 14, // Restored larger font
                            color: Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12), // More spacing
                        
                        // State Badge (Now with more space)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), // Restored padding
                          decoration: BoxDecoration(
                            color: stateColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(16), // Restored larger radius
                            border: Border.all(
                              color: stateColor.withValues(alpha: 0.3),
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _getStateIcon(plant.state),
                                size: 16, // Restored larger icon
                                color: stateColor,
                              ),
                              const SizedBox(width: 6), // More spacing
                              Flexible(
                                child: Text(
                                  _getStateText(plant.state),
                                  style: TextStyle(
                                    fontSize: 12, // Restored font size
                                    fontWeight: FontWeight.w600,
                                    color: stateColor,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
