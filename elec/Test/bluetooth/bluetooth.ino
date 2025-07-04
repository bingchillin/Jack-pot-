#include <NimBLEDevice.h>
#include <ArduinoJson.h>
#include <WiFi.h>

#include <Preferences.h>
Preferences prefs;

#define SERVICE_UUID        "12345678-1234-1234-1234-1234567890ab"
#define WRITE_CHAR_UUID     "abcdef02-1234-1234-1234-abcdefabcdef"
#define NOTIFY_CHAR_UUID    "abcdef03-1234-1234-1234-abcdefabcdef"

#define BUTTON_PIN 33
#define LED_PIN    19

volatile bool startBLERequested = false;
bool bleStarted = false;

unsigned long lastActivity = 0; // 🕒 Temps du dernier message reçu
const unsigned long BLE_TIMEOUT = 300000; // 30 sec d'inactivité

NimBLECharacteristic* notifyChr;
int id_object = 1;

String wifi_ssid = "";
String wifi_password = "";

////var blink led //
volatile bool ledBlinking = false; 
bool ledBlinkingVar = false;


// ==== ISR ====
void IRAM_ATTR onButtonPressed() {
  startBLERequested = true; 
}

/////////////BLE ///////////////////

// ==== BLE CALLBACK ====
class MyCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* pChr, NimBLEConnInfo& info) override {
    String value = pChr->getValue().c_str();
    Serial.print("📥 Reçu Flutter : ");
    Serial.println(value);
    lastActivity = millis();

  

    if (value == "led_blink") {
      ledBlinking = true;
    } else if (value == "led_stop") {
      ledBlinking = false;
      digitalWrite(LED_PIN, LOW);
    } else {
      // On tente de parser comme un JSON
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, value);

      if (!error) {
        if (doc.containsKey("wifi_user") && doc.containsKey("wifi_password")) {
          wifi_ssid = doc["wifi_user"].as<String>();
          wifi_password = doc["wifi_password"].as<String>();

          Serial.println("✅ Identifiants Wi-Fi reçus :");
          Serial.println("SSID: " + wifi_ssid);
          Serial.println("Password: " + wifi_password);

          // Sauvegarde en NVS
          prefs.begin("wifi_creds", false); // false = écriture
          prefs.putString("ssid", wifi_ssid);
          prefs.putString("pass", wifi_password);
          prefs.end();

          Serial.println("💾 Identifiants sauvegardés dans la mémoire !");

          bool wifiOk = testWiFiConnection(wifi_ssid, wifi_password);

          String result = wifiOk ? "wifi_ok" : "wifi_fail";
          notifyChr->setValue(result.c_str());
          notifyChr->notify();
        }
      } else {
        Serial.println("❌ Erreur de parsing JSON");
      }
    }

  }
};

// ==== BLE START ====
void startBLE() {
  Serial.println("🚀 Activation du BLE !");
  NimBLEDevice::init("ESP32-Plante");
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);

  auto* server = NimBLEDevice::createServer();
  auto* service = server->createService(SERVICE_UUID);

  auto* writeChr = service->createCharacteristic(
    WRITE_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE
  );
  writeChr->setCallbacks(new MyCallbacks());

  notifyChr = service->createCharacteristic(
    NOTIFY_CHAR_UUID,
    NIMBLE_PROPERTY::NOTIFY
  );

  service->start();

  NimBLEAdvertising* adv = NimBLEDevice::getAdvertising();
  adv->addServiceUUID(SERVICE_UUID);

  NimBLEAdvertisementData scanData;
  scanData.setName("ESP32-Plante");
  adv->setScanResponseData(scanData);  
  adv->addServiceUUID(SERVICE_UUID);

  adv->start();

  if (!ledBlinking) {
    digitalWrite(LED_PIN, HIGH);
  }
  
  bleStarted = true;
  lastActivity = millis(); // ⏱ Initialiser le timer

  Serial.println("🔵 BLE prêt et visible pour appairage.");
}

// ==== BLE STOP ====
void stopBLE() {
  Serial.println("🛑 Désactivation du BLE (inactivité)");
  NimBLEDevice::getAdvertising()->stop();
  NimBLEDevice::deinit(true);
  digitalWrite(LED_PIN, LOW);
  bleStarted = false;
}

// ==== BLE TASK ====
void taskBleUse(void * parameter) {
  while (1) {
    if (startBLERequested && !bleStarted) {
      startBLERequested = false;
      startBLE();
    }

    // ⏱ Stop si aucune activité depuis 30 sec
    if ((bleStarted && (millis() - lastActivity > BLE_TIMEOUT))) {
      stopBLE();
    }

    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}

/////////////////////////////

// ==== SETUP ====
void setup() {
  Serial.begin(115200);

  prefs.begin("wifi_creds", true); // true = lecture seule
  wifi_ssid = prefs.getString("ssid", "");
  wifi_password = prefs.getString("pass", "");
  prefs.end();

  Serial.println("📂 WiFi chargé depuis la mémoire :");
  Serial.println("SSID: " + wifi_ssid);
  Serial.println("Password: " + wifi_password);


  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), onButtonPressed, FALLING);
  
  xTaskCreate(taskBleUse, "BLE Task", 4096, NULL, 1, NULL);

  xTaskCreate(taskLedBlink, "LED Blink Task", 2048, NULL, 1, NULL);
}


///////// Task //////////

/// LED //////////

void taskLedBlink(void *parameter) {
  while (1) {
    if (ledBlinking) {
        digitalWrite(LED_PIN, ledBlinkingVar);
        ledBlinkingVar = !ledBlinkingVar;   
    }
    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}

////////////////////

////// TEST WIFI ////////
bool testWiFiConnection(const String& ssid, const String& password) {
  WiFi.disconnect(true);
  WiFi.begin(ssid.c_str(), password.c_str());

  Serial.println("🔌 Connexion Wi-Fi en cours...");

  unsigned long startAttemptTime = millis();
  const unsigned long timeout = 10000; // 10 secondes

  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < timeout) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connexion Wi-Fi réussie !");
    return true;
  } else {
    Serial.println("\n❌ Échec de connexion Wi-Fi.");
    return false;
  }
}

/////////////////////////

///////////////////////////

// ==== LOOP ====
void loop() {
  static unsigned long last = 0;
  if (bleStarted && millis() - last > 5000) {
    String msg = String(id_object);
    notifyChr->setValue(msg.c_str());
    notifyChr->notify();
    Serial.println("📤 Envoyé : " + msg);
    last = millis();

     Serial.println("SSID: " + wifi_ssid);
     Serial.println("Password: " + wifi_password);
  }
}
