import 'package:flutter/material.dart';
import 'package:jackpote/models/plant_type.dart';

class ChoosePlantDetailPage extends StatelessWidget {
  final PlantType plant;

  const ChoosePlantDetailPage({Key? key, required this.plant}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(plant.title),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Liste horizontale des avatars (images)
            SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: plant.avatars.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final avatar = plant.avatars[index];
                  if (avatar.pathPicture.isEmpty) {
                    return const Icon(Icons.image_not_supported, size: 80);
                  }
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      avatar.pathPicture,
                      width: 100,
                      height: 100,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.broken_image, size: 80),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 16),

            // Titre
            Text(
              plant.title,
              style: Theme.of(context).textTheme.headlineMedium,
            ),

            const SizedBox(height: 8),

            // scientistName
            if (plant.scientistName != null && plant.scientistName!.isNotEmpty)
              Text(
                "Nom scientifique : ${plant.scientistName}",
                style: Theme.of(context).textTheme.bodyMedium,
              ),

            const SizedBox(height: 8),

            // familyName
            if (plant.familyName != null && plant.familyName!.isNotEmpty)
              Text(
                "Famille : ${plant.familyName}",
                style: Theme.of(context).textTheme.bodyMedium,
              ),

            const SizedBox(height: 16),

            // Description
            if (plant.description != null && plant.description!.isNotEmpty)
              Text(
                plant.description!,
                style: Theme.of(context).textTheme.bodyLarge,
              ),

            const SizedBox(height: 24),

            // Advise (depuis PlantType.advise)
            if (plant.advise != null && plant.advise!.isNotEmpty)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Conseils :",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    plant.advise!,
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
