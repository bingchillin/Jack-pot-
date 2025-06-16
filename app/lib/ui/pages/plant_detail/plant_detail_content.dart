import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../app_config.dart';
import '../../../bloc/plant_detail/plant_detail_bloc.dart';
import '../../../bloc/plant_detail/plant_detail_state.dart';
import '../widget/plant_card_favorite/plant_control_switches_widget.dart';

class PlantDetailContent extends StatelessWidget {
  const PlantDetailContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Détail de la plante")),
      body: BlocBuilder<PlantDetailBloc, PlantDetailState>(
        builder: (context, state) {
          if (state is PlantDetailLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is PlantDetailLoaded) {
            final plant = state.plant;
            final imageUrl = plant.plantType.pathPicture != null
                ? Uri.parse(AppConfig.baseUrlS)
                .resolve(plant.plantType.pathPicture!)
                .toString()
                : null;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          plant.title,
                          style: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.help_outline),
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (_) => AlertDialog(
                              title: Text(plant.plantType.title),
                              content: Text(
                                  plant.plantType.description ?? "Pas de description"),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text("Fermer"),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (imageUrl != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        imageUrl,
                        height: 200,
                        fit: BoxFit.cover,
                      ),
                    ),
                  const SizedBox(height: 16),
                  const Text("Contrôles",
                      style:
                      TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  PlantControlSwitches(plant: plant),
                ],
              ),
            );
          } else if (state is PlantDetailError) {
            return Center(child: Text(state.message));
          } else {
            return const SizedBox();
          }
        },
      ),
    );
  }
}
