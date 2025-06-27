#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLECharacteristic *writeCharacteristic;

class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pChar) override {
    std::string value = std::string(pChar->getValue().c_str());

    if (value.length() > 0) {
      Serial.print("✳️ Reçu par BLE : ");
      Serial.println(value.c_str());
    }
  }
};

void setup() {
  Serial.begin(115200);
  BLEDevice::init("ESP32-Plante");

  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService("12345678-1234-1234-1234-1234567890ab");

  writeCharacteristic = pService->createCharacteristic(
    "abcdef02-1234-1234-1234-abcdefabcdef",
    BLECharacteristic::PROPERTY_WRITE
  );
  writeCharacteristic->setCallbacks(new MyCallbacks());

  pService->start();

  // 🔧 MISE À JOUR ICI : Ajout du UUID de service dans l’advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(pService->getUUID());
  BLEDevice::startAdvertising();

  Serial.println("🔵 BLE prêt, en attente de connexion pour écrire");
}

void loop() {
  delay(1000);
}
