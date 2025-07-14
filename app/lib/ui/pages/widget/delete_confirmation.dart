import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:jackpote/providers/auth_provider.dart';
import 'package:jackpote/services/object_profile_service.dart';

class DeleteConfirmation extends StatelessWidget {
  final int plantId;

  const DeleteConfirmation({Key? key, required this.plantId}) : super(key: key);

  Future<void> _deletePlant(BuildContext context, int id, String token) async {
    try {
      final success = await ObjectProfileService().deleteObjectProfile(id, token);
      if (success) {
        Navigator.pushNamedAndRemoveUntil(context, '/plant', (route) => false);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Supprimer la plante")),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Êtes-vous sûr de vouloir supprimer cette plante de ce pot ?",
              style: TextStyle(fontSize: 20),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.cancel),
                  label: const Text("Annuler"),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.grey),
                ),
                ElevatedButton.icon(
                onPressed: () => _deletePlant(context, plantId, AuthProvider().accessToken.toString()),
                  icon: const Icon(Icons.delete),
                  label: const Text("Supprimer"),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
