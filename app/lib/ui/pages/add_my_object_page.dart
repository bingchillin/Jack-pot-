import 'package:flutter/material.dart';

class AddMyObjectPage extends StatelessWidget {
  const AddMyObjectPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Ajouter une plante',
        ),
        elevation: 0,
      ),

      // Même padding et scroll que MyPlantPage
      body: Container(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Center(
            child: Text(
                'Ajout d\'une plante',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );
  }
}
