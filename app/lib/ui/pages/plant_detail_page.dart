import 'package:app/ui/pages/plant_detail/sensor_value.dart';
import 'package:app/ui/pages/widget/plant_card_favorite/plant_control_switches_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../providers/auth_provider.dart';
import '../../../services/object_profile_service.dart';
import '../../bloc/plant_detail/plant_detail_bloc.dart';
import '../../../app_config.dart';
import '../../models/object_profile.dart';

class PlantDetailPage extends StatelessWidget {
  final int plantId;

  const PlantDetailPage({super.key, required this.plantId});

  @override
  Widget build(BuildContext context) {
    final token = context.read<AuthProvider>().accessToken;

    if (token == null) {
      return Scaffold(
        appBar: AppBar(title: Text("Détail de la plante")),
        body: Center(child: Text("Token manquant")),
      );
    }

    return BlocProvider(
      create: (_) => PlantDetailBloc(
        service: ObjectProfileService(),
        plantId: plantId,
        token: token,
      ),
      child: Builder(
        builder: (context) {
          final bloc = context.read<PlantDetailBloc>();

          return Scaffold(
            appBar: AppBar(
              title: StreamBuilder<ObjectProfile>(
                stream: bloc.plantStream,
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    return Text(snapshot.data!.title);
                  }
                  return const Text("Détail de la plante");
                },
              ),
            ),
            body: StreamBuilder<ObjectProfile>(
              stream: bloc.plantStream,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final plant = snapshot.data!;
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
                              plant.plantType.title,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
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
                                    plant.plantType.description ?? '',
                                  ),
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
                        Center(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              imageUrl,
                              height: 200,
                              fit: BoxFit.cover,
                            ),
                          )
                        ),
                      const SizedBox(height: 16),
                      Center(
                        child: Text(
                          getStateText(plant.state),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: plant.state == 5 ? Colors.red : Colors.green,
                          ),
                        ),
                      ),
                      Text(
                        plant.description,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      PlantControlSwitches(plant: plant),

                      Text(
                        "Conseil de la plante",
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        plant.advise ?? "Aucun conseil",
                        style: TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "Recette d'entretien",
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        plant.recipe ?? "Aucune recette disponible",
                        style: TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 24),

                      Text(
                        "Capteurs",
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      SensorValue(label: "Humidité de l'air", value: plant.humidityAirSensor),
                      SensorValue(label: "Humidité du sol", value: plant.humidityGroundSensor),
                      SensorValue(label: "pH du sol", value: plant.phGroundSensor),
                      SensorValue(label: "Conductivité/Fertilité", value: plant.conductivityElectriqueFertilitySensor),
                      SensorValue(label: "Luminosité", value: plant.lightSensor),
                      SensorValue(label: "Température du sol", value: plant.temperatureSensorGround),
                      SensorValue(label: "Température externe", value: plant.temperatureSensorExtern),
                      SensorValue(label: "Temps d’exposition au soleil", value: plant.expositionTimeSun),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
