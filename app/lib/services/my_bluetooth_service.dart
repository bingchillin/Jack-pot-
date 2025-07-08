import 'dart:convert';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class MyBluetoothService {
  static final MyBluetoothService _instance = MyBluetoothService._internal();

  static MyBluetoothService get instance => _instance;

  MyBluetoothService._internal();

  BluetoothDevice? connectedDevice;
  BluetoothCharacteristic? writeChar;
  BluetoothCharacteristic? notifyChar;

  BluetoothCharacteristic? get readChar => notifyChar;

  Future<void> sendData(Map<String, dynamic> data) async {
    if (writeChar == null) throw Exception("writeChar non initialisé");
    final payload = utf8.encode(jsonEncode(data));
    await writeChar!.write(payload);
  }

  void reset() {
    connectedDevice = null;
    writeChar = null;
    notifyChar = null;
  }
}
