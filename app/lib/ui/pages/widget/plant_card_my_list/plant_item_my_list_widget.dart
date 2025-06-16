import 'package:flutter/material.dart';
import '../../../../models/object_profile.dart';
import 'package:app/app_config.dart';
import '../../plant_detail_page.dart';

class PlantItemMyListWidget extends StatelessWidget {
  final ObjectProfile plant;

  PlantItemMyListWidget({
    Key? key,
    required this.plant,
  }) : super(key: ValueKey(plant.idObjectProfile));

  @override
  Widget build(BuildContext context) {
    final pathPicture = plant.plantType.pathPicture;
    final borderColor = (plant.state == 5) ? Colors.red : Colors.green;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 1.0),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  PlantDetailPage(plantId: plant.idObjectProfile),
            ),
          );
        },
        child: Card(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: borderColor, width: 2),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 60,
                    height: 60,
                    color: Colors.grey[200],
                    child: pathPicture != null
                        ? Image.network(
                      Uri.parse(AppConfig.baseUrlS)
                          .resolve(pathPicture)
                          .toString(),
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.error),
                    )
                        : const Icon(Icons.image_not_supported),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    plant.title ?? 'Nom inconnu',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
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
