import 'package:app/ui/pages/widget/plant_control_switches_widget.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../models/object_profile.dart';
import 'package:app/app_config.dart';

import '../../../services/object_profile_service.dart';
import '../plant_detail_page.dart';

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

  String getStateText(int? state) {
    switch (state) {
      case 0:
        return "Parfait pour moi";
      case 1:
        return "Je vais très bien";
      case 2:
        return "Je vais bien";
      case 3:
        return "Je suis ok";
      case 4:
        return "Je me sens moyen";
      case 5:
        return "Critique ! URGENT !";
      default:
        return "État inconnu";
    }
  }

  @override
  Widget build(BuildContext context) {
    final picturePath = plant.plantType.pathPicture;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: screenWidth * 0.8,  // Largeur max à 80% écran
          maxHeight: screenHeight * 0.95, // Hauteur max à 95% écran
        ),
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PlantDetailPage(plantId: plant.idObjectProfile),
              ),
            );
          },
    borderRadius: BorderRadius.circular(16),
        child: Card(
          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: (plant.state == 5) ? Colors.red : Colors.green,
              width: 2,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              child: IntrinsicHeight(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plant.title ?? 'Nom inconnu',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Image centrée et crop intelligente
                    if (picturePath != null)
                      Center(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            height: 180,
                            width: 180,
                            color: Colors.grey[200],
                            child: Image.network(
                              Uri.parse(AppConfig.baseUrlS).resolve(picturePath).toString(),
                              fit: BoxFit.cover,
                              alignment: Alignment.center,
                              errorBuilder: (context, error, stackTrace) =>
                              const Center(child: Text("Image non disponible")),
                            ),
                          ),
                        ),
                      )
                    else
                      const Text("Pas d'image disponible"),
                    const SizedBox(height: 8),
                    Text(
                      getStateText(plant.state),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    // use switch dynamic
                    PlantControlSwitches(plant: plant),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      ),
    );
  }
}
