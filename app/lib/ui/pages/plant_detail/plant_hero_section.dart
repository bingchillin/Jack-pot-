import 'package:flutter/material.dart';
import '../../../models/object_profile.dart';
import '../../../app_config.dart';
import '../../../l10n/app_localizations.dart';
import '../widget/plant_card_favorite/plant_control_switches_widget.dart';

class PlantHeroSection extends StatelessWidget {
  final ObjectProfile plant;

  const PlantHeroSection({Key? key, required this.plant}) : super(key: key);

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

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final stateColor = _getStateColor(plant.state);
    final imageUrl = plant.plantType?.pathPicture != null
        ? Uri.parse(AppConfig.baseUrl).resolve(plant.plantType!.pathPicture!).toString()
        : null;

    return Container(
      height: 400,
      child: Stack(
        children: [
          // Background Image
          Container(
            height: 320,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.green[50]!,
                  Colors.green[100]!,
                  Colors.green[200]!,
                ],
              ),
            ),
            child: imageUrl != null
                ? ClipRRect(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(32),
                      bottomRight: Radius.circular(32),
                    ),
                    child: Stack(
                      children: [
                        Image.network(
                          imageUrl,
                          width: double.infinity,
                          height: 320,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.green[100]!,
                                  Colors.green[200]!,
                                ],
                              ),
                            ),
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.eco,
                                    size: 64,
                                    color: Colors.green[600],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    localizations.imageNotAvailable,
                                    style: TextStyle(
                                      color: Colors.green[700],
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        // Gradient Overlay
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(32),
                              bottomRight: Radius.circular(32),
                            ),
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.3),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                : Container(
                    decoration: BoxDecoration(
                      borderRadius: const BorderRadius.only(
                        bottomLeft: Radius.circular(32),
                        bottomRight: Radius.circular(32),
                      ),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.green[100]!,
                          Colors.green[200]!,
                        ],
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.eco,
                            size: 64,
                            color: Colors.green[600],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            localizations.noImage,
                            style: TextStyle(
                              color: Colors.green[700],
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
          ),

          // Plant Info Card
          Positioned(
            bottom: 0,
            left: 24,
            right: 24,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
                border: Border.all(
                  color: stateColor.withValues(alpha: 0.2),
                  width: 2,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Plant Name and Type
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                plant.title ?? localizations.unknownName,
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey[800],
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                plant.plantType?.title ?? localizations.unknownType,
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[600],
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        // Info Button
                        IconButton(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (context) => AlertDialog(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                title: Text(plant.plantType?.title ?? localizations.unknownType),
                                content: Text(plant.plantType?.description ?? localizations.notAvailable),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context),
                                    child: Text(
                                      localizations.close,
                                      style: TextStyle(color: Colors.green[600]),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                          icon: Icon(
                            Icons.info_outline,
                            color: Colors.green[600],
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // State Badge and Controls
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
                                _getStateIcon(plant.state),
                                size: 18,
                                color: stateColor,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _getStateText(localizations, plant.state),
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
                        // Control Switches
                        PlantControlSwitches(plant: plant),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
} 