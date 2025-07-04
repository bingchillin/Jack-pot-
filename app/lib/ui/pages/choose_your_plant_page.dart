import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class ChooseYouPlantPage extends StatelessWidget {
  const ChooseYouPlantPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Configuration réussie")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 80),
            SizedBox(height: 16),
            Text("🌱 Votre pot est bien connecté au Wi-Fi !"),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: Text("Retour à l'accueil"),
            ),
          ],
        ),
      ),
    );
  }
}
