import 'package:flutter/material.dart';

class PlantDetailPage extends StatelessWidget {
  final int plantId;

  const PlantDetailPage({Key? key, required this.plantId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Plante ID: $plantId'),
      ),
      body: Center(
        child: Text(
          'Voici l\'ID de la plante : $plantId',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
