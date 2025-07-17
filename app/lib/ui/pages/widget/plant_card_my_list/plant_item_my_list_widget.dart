import 'package:flutter/material.dart';
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

class PlantItemMyListWidget extends StatelessWidget {
  final ObjectProfile plant;

  PlantItemMyListWidget({
    Key? key,
    required this.plant,
  }) : super(key: ValueKey(plant.idObjectProfile));

  Future<void> _showScorePopup(BuildContext context) async {
    try {
      // Check if popup is already showing
      if (ImprovedScorePopupService().isPopupShowing) {
        print('⚠️ Popup already showing, skipping my list plant item popup');
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
        );
      }
    }
  }


  String _getStateText(int? state) {
    switch (state) {
      case 1:
        return 'Excellent';
      case 2:
        return 'Bon';
      case 3:
        return 'Moyen';
      case 4:
        return 'Faible';
      case 5:
        return 'Critique';
      default:
        return 'Inconnu';
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
      margin: const EdgeInsets.only(bottom: 16),
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
          borderRadius: BorderRadius.circular(20),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
              border: Border.all(
                color: stateColor.withValues(alpha: 0.3),
                width: 2,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Plant Image
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        colors: [
                          Colors.green[50]!,
                          Colors.green[100]!,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.green[200]!.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
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
                            color: Colors.green[100],
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(
                            Icons.eco,
                            color: Colors.green[600],
                            size: 32,
                          ),
                        ),
                      )
                          : Container(
                        decoration: BoxDecoration(
                          color: Colors.green[100],
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(
                          Icons.eco,
                          color: Colors.green[600],
                          size: 32,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 16),
                  
                  // Plant Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plant.title ?? localizations.unknownName,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: Colors.grey[800],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          plant.plantType?.title ?? localizations.unknownType,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: stateColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
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
                                size: 16,
                                color: stateColor,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _getStateText(plant.state),
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: stateColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Score and Arrow buttons
                  Column(
                    children: [
                      // Arrow Icon
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: Colors.green[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
