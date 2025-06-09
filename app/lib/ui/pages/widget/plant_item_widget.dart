import 'package:flutter/material.dart';
import '../../../models/object_profile.dart';

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

  @override
  Widget build(BuildContext context) {
    final picturePath = plant.plantType.pathPicture != null ? 'assets/${plant.plantType.pathPicture}' : null;
    final screenWidth = MediaQuery.of(context).size.width;

    return Center( // Pour centrer les cards horizontalement
      child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: screenWidth * 0.5, // 👈 ne dépasse jamais la moitié de l’écran
          ),
      child: Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min, // <-- cadre auto-ajusté
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Titre
            Text(
              plant.title ?? 'Nom inconnu',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),

            const SizedBox(height: 12),

            // Image
            picturePath != null
                ? ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(
                picturePath,
                height: 120,
                width: 120,
                fit: BoxFit.cover,
              ),
            )
                : const Text("Pas d'image disponible"),

            const SizedBox(height: 16),

            // STATE
            Text(
              plant.state.toString() ?? 'Nom inconnu',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),

            // Switch Automatique
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('AUTO', style: TextStyle(fontSize: 16)),
                Switch(
                  value: plant.isAutomatic ?? false,
                  onChanged: onToggleAutomatic,
                  activeColor: Colors.green,
                ),
              ],
            ),

            // Switch Arrosage
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('ARROSER', style: TextStyle(fontSize: 16)),
                Switch(
                  value: plant.isWillWatering ?? false,
                  onChanged: onToggleWillWatering,
                  activeColor: Colors.blue,
                ),
              ],
            ),
          ],
        ),
      ),
            ),
    )
    );
  }
}
