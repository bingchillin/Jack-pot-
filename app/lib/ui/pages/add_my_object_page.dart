import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:convert';

const instructionText = '''
🔵 Pour connecter votre pot intelligent :

1. Appuyez longtemps sur le bouton bleu situé sur le pot.
2. Patientez quelques secondes jusqu’à ce que la LED bleue s’allume.
3. Approchez votre téléphone au plus près du pot.

Une fois détecté, la configuration démarrera automatiquement.
''';

class AddMyObjectPage extends StatefulWidget {
  @override
  _AddMyObjectPageState createState() => _AddMyObjectPageState();
}

enum ScanState {
  waitingForUser,
  scanning,
  errorNoDevice,
  connected,
  waitingForIdObject
}

class _AddMyObjectPageState extends State<AddMyObjectPage> {
  BluetoothDevice? targetDevice;
  BluetoothCharacteristic? writeChar;
  BluetoothCharacteristic? notifyChar;

  String statusMessage = instructionText;
  String? idObject;

  bool waitingForWifiResult = false;

  ScanState scanState = ScanState.waitingForUser;

  final TextEditingController plantNameController = TextEditingController();
  final TextEditingController wifiUserController = TextEditingController();
  final TextEditingController wifiPassController = TextEditingController();

  final String targetDeviceName = "ESP32-Plante";
  final String writeCharUUID = "abcdef02-1234-1234-1234-abcdefabcdef".toLowerCase();
  final String notifyCharUUID = "abcdef03-1234-1234-1234-abcdefabcdef".toLowerCase();

  StreamSubscription<List<ScanResult>>? scanSubscription;
  StreamSubscription<List<int>>? notifySubscription;

  @override
  void initState() {
    super.initState();
    requestPermissions().then((_) {
      startScan();
    });
  }

  @override
  void dispose() {
    plantNameController.dispose();
    wifiUserController.dispose();
    wifiPassController.dispose();
    scanSubscription?.cancel();
    notifySubscription?.cancel();
    targetDevice?.disconnect();
    super.dispose();
  }

  Future<void> requestPermissions() async {
    await [
      Permission.bluetooth,
      Permission.bluetoothScan,
      Permission.bluetoothConnect,
      Permission.location,
    ].request();
  }

  void startScan() async {
    setState(() {
      scanState = ScanState.scanning;
      statusMessage =
      "🔍 Recherche du pot en cours… Appuyer longtemps sur le bouton bleu. Assurez-vous que la led bleu est allumée. Veuillez rester proche de votre appareil.";
      targetDevice = null;
      writeChar = null;
      notifyChar = null;
      idObject = null;
      waitingForWifiResult = false;
    });

    await FlutterBluePlus.stopScan();
    await scanSubscription?.cancel();

    scanSubscription = FlutterBluePlus.scanResults.listen((results) async {
      for (ScanResult r in results) {
        if (r.device.name == targetDeviceName) {
          await FlutterBluePlus.stopScan();
          await scanSubscription?.cancel();
          connectToDevice(r.device);
          return;
        }
      }
    });

    await FlutterBluePlus.startScan(timeout: Duration(seconds: 30));

    // Affiche erreur si rien trouvé après délai
    Future.delayed(Duration(seconds: 32), () {
      if (scanState == ScanState.scanning) {
        scanSubscription?.cancel();
        setState(() {
          scanState = ScanState.errorNoDevice;
          statusMessage = '''
❌ Aucun pot détecté.

✅ Assurez-vous que :
• Appuyez longtemps sur le bouton bleu jusqu'à l'apparition d'une lumière bleue.
• La LED bleue est allumée sur le pot.
• Le téléphone est proche du pot.

Appuyez sur “Réessayer” pour relancer la détection.''';
        });
      }
    });
  }

  void connectToDevice(BluetoothDevice device) async {
    setState(() {
      scanState = ScanState.waitingForIdObject;
      statusMessage = "⏳ Connexion au pot… Récupération des données en cours.";
    });

    try {
      await device.connect(timeout: Duration(seconds: 20));
    } catch (e) {
      setState(() {
        scanState = ScanState.errorNoDevice;
        statusMessage = "❌ Connexion échouée. Veuillez vérifier le pot et réessayer.";
      });
      return;
    }

    setState(() {
      targetDevice = device;
    });

    List<BluetoothService> services = await device.discoverServices();
    for (var service in services) {
      for (var char in service.characteristics) {
        String charUuid = char.uuid.toString().toLowerCase();
        if (charUuid == writeCharUUID) {
          writeChar = char;
        }
        if (charUuid == notifyCharUUID) {
          notifyChar = char;
          await char.setNotifyValue(true);
          notifySubscription?.cancel();
          notifySubscription = char.value.listen((value) {
            String data = utf8.decode(value);
            setState(() {
              idObject = data;
              scanState = ScanState.connected;
              statusMessage = "✅ Pot détecté et prêt à être configuré.";
            });
          });
        }
      }
    }

    if (writeChar != null) {
      await writeChar!.write(utf8.encode("led_blink"));
    }

    if (writeChar == null || notifyChar == null) {
      setState(() {
        statusMessage =
        "❌ Échec : le pot ne répond pas correctement. Vérifiez sa configuration.";
        scanState = ScanState.errorNoDevice;
      });
    }
  }

  void sendData() async {
    if (writeChar == null || notifyChar == null) return;

    setState(() {
      waitingForWifiResult = true;
    });

    Map<String, String> data = {
      "wifi_user": wifiUserController.text,
      "wifi_password": wifiPassController.text,
      "plant_name":
      plantNameController.text.isEmpty ? "PlanteSansNom" : plantNameController.text,
    };

    String jsonString = jsonEncode(data);
    await writeChar!.write(utf8.encode(jsonString));

    notifySubscription?.cancel();
    notifySubscription = notifyChar!.value.listen((value) {
      String response = utf8.decode(value);
      print("🛰️ Réponse du pot : $response");

      if (response == "wifi_ok") {
        notifySubscription?.cancel();
        setState(() => waitingForWifiResult = false);
        Navigator.pushNamed(context, '/choose_your_plant');
      } else if (response == "wifi_fail") {
        notifySubscription?.cancel();
        setState(() {
          waitingForWifiResult = false;
          statusMessage = "❌ Connexion Wi-Fi échouée. Veuillez réessayer.";
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
              Text("❌ Échec de connexion au Wi-Fi. Veuillez vérifier les identifiants.")),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget body;

    switch (scanState) {
      case ScanState.waitingForUser:
      case ScanState.scanning:
        body = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(statusMessage),
            if (scanState == ScanState.scanning)
              Padding(
                padding: const EdgeInsets.only(top: 20),
                child: Center(child: CircularProgressIndicator()),
              ),
          ],
        );
        break;

      case ScanState.errorNoDevice:
        body = Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(statusMessage, textAlign: TextAlign.center),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => startScan(),
                child: Text("🔄 Réessayer"),
              ),
            ],
          ),
        );
        break;

      case ScanState.waitingForIdObject:
        body = Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text("⏳ Connexion en cours…"),
            ],
          ),
        );
        break;

      case ScanState.connected:
        if (waitingForWifiResult) {
          body = Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text("🔄 Vérification de la connexion Wi-Fi en cours…"),
              ],
            ),
          );
          break;
        }
        if (idObject == null) {
          body = Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text("📡 En attente des données du pot…"),
              ],
            ),
          );
        } else {
          body = SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("📦 Identifiant du pot : $idObject"),
                SizedBox(height: 16),
                Text("📝 Veuillez configurer votre pot :"),
                SizedBox(height: 8),
                Text(
                  "1. Indiquez un prénom pour votre plante (facultatif).\n"
                      "2. Saisissez le nom du réseau Wi-Fi ainsi que son mot de passe.",
                ),
                SizedBox(height: 8),
                Text(
                  "⚠️ Le pot devra rester connecté en permanence à ce réseau pour fonctionner correctement.",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: plantNameController,
                  decoration: InputDecoration(labelText: "Prénom de la plante"),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: wifiUserController,
                  decoration: InputDecoration(labelText: "Nom du réseau Wi-Fi"),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: wifiPassController,
                  decoration: InputDecoration(labelText: "Mot de passe Wi-Fi"),
                  obscureText: true,
                ),
                SizedBox(height: 24),
                ElevatedButton(
                  onPressed: sendData,
                  child: Text("🚀 Envoyer la configuration"),
                ),
              ],
            ),
          );
        }
        break;
    }

    return Scaffold(
      appBar: AppBar(title: Text("Connexion à un pot intelligent")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: body,
      ),
    );
  }
}
