import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'dart:convert';

class AddMyObjectPage extends StatefulWidget {
  @override
  _AddMyObjectPageState createState() => _AddMyObjectPageState();
}

class _AddMyObjectPageState extends State<AddMyObjectPage> {
  BluetoothDevice? targetDevice;
  BluetoothCharacteristic? writeChar;
  String status = "Recherche BLE…";
  final TextEditingController _textController = TextEditingController();
  final String targetServiceUUID = "12345678-1234-1234-1234-1234567890ab";
  final String writeCharUUID = "abcdef02-1234-1234-1234-abcdefabcdef";

  @override
  void initState() {
    super.initState();
    _checkBluetoothStatus();
  }

  void _checkBluetoothStatus() async {
    var state = await FlutterBluePlus.adapterState.first;
    if (state != BluetoothAdapterState.on) {
      setState(() => status = "❌ Bluetooth désactivé");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("🔌 Active le Bluetooth pour connecter l'objet")),
      );
    } else {
      _startScan();
    }
  }

  void _startScan() async {
    setState(() => status = "🔍 Scan en cours…");

    // Démarrer le scan
    await FlutterBluePlus.startScan(timeout: Duration(seconds: 10));

    // Écouter les résultats
    FlutterBluePlus.scanResults.listen((results) async {
      for (ScanResult r in results) {
        // DEBUG : Affiche tous les périphériques détectés
        print("📡 Périphérique trouvé : ${r.device.name} / UUIDs: ${r.advertisementData.serviceUuids}");

        // Recherche par UUID
        if (r.advertisementData.serviceUuids.contains(targetServiceUUID)) {
          await FlutterBluePlus.stopScan();
          setState(() => status = "✅ Objet trouvé !");
          _connect(r.device);
          return;
        }
      }
    });

    // Si rien trouvé après timeout
    Future.delayed(Duration(seconds: 11), () {
      if (targetDevice == null) setState(() => status = "❌ Aucun objet détecté");
    });
  }

  void _connect(BluetoothDevice device) async {
    await device.connect();
    setState(() => status = "🔗 Connecté");
    targetDevice = device;

    List<BluetoothService> services = await device.discoverServices();
    for (var service in services) {
      for (var c in service.characteristics) {
        if (c.uuid.toString().toLowerCase() == writeCharUUID) {
          writeChar = c;
          print("✅ Caractéristique trouvée pour écrire !");
        }
      }
    }
  }

  void _sendData() async {
    if (writeChar == null) return;
    String text = _textController.text;
    await writeChar!.write(utf8.encode(text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("✅ Envoyé : \"$text\"")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Ajouter une plante')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(status, style: TextStyle(fontSize: 16)),
            TextField(
              controller: _textController,
              decoration: InputDecoration(labelText: "Nom de la plante"),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              child: Text("Envoyer vers ESP32"),
              onPressed: writeChar != null ? _sendData : null,
            ),
          ],
        ),
      ),
    );
  }
}
