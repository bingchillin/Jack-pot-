import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:jackpote/core/env_config.dart';
import 'package:jackpote/models/plant_type.dart';
import 'package:jackpote/providers/auth_provider.dart';
import 'package:provider/provider.dart';

import '../../app_config.dart';
import '../../models/avatar.dart';
import '../../services/my_bluetooth_service.dart';
import '../../services/object_profile_service.dart';

class ChoosePlantDetailPage extends StatefulWidget {
  final PlantType plant;
  final String? plantName;
  final String? idObject;

  const ChoosePlantDetailPage({Key? key, required this.plant, this.plantName, this.idObject}) : super(key: key);

  @override
  State<ChoosePlantDetailPage> createState() => _ChoosePlantDetailPageState();
}

class _ChoosePlantDetailPageState extends State<ChoosePlantDetailPage> {
  bool _isLoading = false;

  Future<void> _createProfileAndConnect() async {
    setState(() {
      _isLoading = true;
    });

    final token = AuthProvider().accessToken;
    final objectProfileService = ObjectProfileService();

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final idObj = widget.idObject;
      print("idObject brut : $idObj");

      final createdProfile = await objectProfileService.createObjectProfile(
        token: authProvider.accessToken!,
        idPlantType: widget.plant.idPlantType,
        userId: int.parse(authProvider.userId!),
        title: widget.plantName ?? widget.plant.title,
        idObject: 1,
      );

      final Map<String, dynamic> config = {
        "id_object_profile": createdProfile.idObjectProfile.toString(),
        "base_url": EnvConfig.apiUrl,
      };

      await _connectAndListen(config);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("✅ Profil créé et variable reçue !")),
      );

      Navigator.of(context).pushNamedAndRemoveUntil('/', (Route<dynamic> route) => false);
    } catch (e) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      print("token:${authProvider.accessToken}");
      print("idPlantType:" + widget.plant.idPlantType.toString());
      print("userId:${authProvider.userId}");
      print("title2:" + widget.plantName!);
      print("idObject:" + widget.idObject!);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "❌ Erreur : l'objet a été ajouté, mais la connexion avec l'appareil a été interrompue. Merci de vous rapprocher de l'objet pour finir la configuration.",
          ),
          duration: Duration(seconds: 4),
        ),
      );
      Navigator.of(context).pushNamedAndRemoveUntil('/', (Route<dynamic> route) => false);
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _connectAndListen(Map<String, dynamic> config) async {
    final writeChar = MyBluetoothService.instance.writeChar;
    final readChar = MyBluetoothService.instance.readChar;

    if (writeChar == null || readChar == null) {
      throw Exception("Bluetooth non initialisé.");
    }

    StreamSubscription<List<int>>? subscription;
    final completer = Completer<String>();

    subscription = readChar.value.listen((data) {
      final received = utf8.decode(data);
      if (received.isNotEmpty && !completer.isCompleted) {
        writeChar.write(utf8.encode(jsonEncode(config)));
        completer.complete(received);
        //writeChar.write(utf8.encode("stopBle"));
        subscription?.cancel();
      }
    });



    try {
      await completer.future.timeout(const Duration(seconds: 15));
    } on TimeoutException {
      subscription?.cancel();
      throw Exception(
        "Plus connexion avec le pot, rapprochez-vous et assurez-vous que la LED clignote toujours.",
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final plant = widget.plant;
    final plantName = widget.plantName;

    final List<Avatar> filteredAvatars = plant.avatars.where((a) => a.typeP == 1 && a.pathPicture.isNotEmpty).toList();


    return Scaffold(
      appBar: AppBar(
        title: Text("Ta plante : ${plantName?.isNotEmpty == true ? plantName : plant.title}"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 300,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: filteredAvatars.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final avatar = filteredAvatars[index];
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      Uri.parse(AppConfig.baseUrlSrc)
                          .resolve(avatar.pathPicture)
                          .toString(),
                      width: 300,
                      height: 300,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.broken_image, size: 80),
                    ),
                  );
                },
              ),
            ),


            const SizedBox(height: 16),

            Text(
              plant.title,
              style: Theme.of(context).textTheme.headlineMedium,
            ),

            const SizedBox(height: 8),

            if (plant.scientistName != null && plant.scientistName!.isNotEmpty)
              Text(
                "Nom scientifique : ${plant.scientistName}",
                style: Theme.of(context).textTheme.bodyMedium,
              ),

            const SizedBox(height: 8),

            if (plant.familyName != null && plant.familyName!.isNotEmpty)
              Text(
                "Famille : ${plant.familyName}",
                style: Theme.of(context).textTheme.bodyMedium,
              ),

            const SizedBox(height: 16),

            if (plant.description != null && plant.description!.isNotEmpty)
              Text(
                plant.description!,
                style: Theme.of(context).textTheme.bodyLarge,
              ),

            const SizedBox(height: 24),

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
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(12.0),
        child: ElevatedButton(
          onPressed: _isLoading ? null : _createProfileAndConnect,
          child: _isLoading
              ? const SizedBox(
            height: 24,
            width: 24,
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
              : const Text("🌱 Créer le profil et connecter au pot"),
        ),
      ),
    );
  }
}
