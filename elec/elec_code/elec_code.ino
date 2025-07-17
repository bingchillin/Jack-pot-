
// WIFI communication
#include <WiFi.h>
#include <HTTPClient.h>


//sensor temperature ground
#include <OneWire.h>
#include <DallasTemperature.h>

// sensor temperature humidity extern
#include "DHT.h"

// BLE for bluetooth
#include <NimBLEDevice.h>
// json parse
#include <ArduinoJson.h>

#include <Preferences.h>


#define SERVICE_UUID        "12345678-1234-1234-1234-1234567890ab"
#define WRITE_CHAR_UUID     "abcdef02-1234-1234-1234-abcdefabcdef"
#define NOTIFY_CHAR_UUID    "abcdef03-1234-1234-1234-abcdefabcdef"


// PIN
#define SENSOR_TEMPERATURE_GROUND_P 15
#define SENSOR_WATER_P 34
#define SENSOR_HUMIDITY_GROUND  35
#define SENSOR_TEMPERATURE_HUMIDITY_EXTERN 14
#define SENSOR_UV 32
#define MOTOR 16
#define UVLED 18
#define BUTTON_PIN_BLUETOOTH 33
#define BUTTON_PIN_RED_WATER 13
#define BUTTON_PIN_WHITE_UV_LED 4

#define LED_PIN_BLUE 19
#define LED_PIN_RED 27
#define LED_PIN_YELLOW 26
#define LED_PIN_GREEN 21

// sensor temperature humidity extern
#define DHTTYPE DHT11   


// configure sensor temperature ground
OneWire sensor_temprature_ground_p(SENSOR_TEMPERATURE_GROUND_P);

// Création sensor for temperature ground
DallasTemperature sensors(&sensor_temprature_ground_p);

// configure sensor temperature humidity extern
DHT dht(SENSOR_TEMPERATURE_HUMIDITY_EXTERN, DHTTYPE);

////////////variable sensor
float sensor_temprature_ground = 0;
float sensor_water_level = 0;
float sensor_ground_humidity = 0;
float sensor_extern_temperature = 0;
float sensor_extern_humidity = 0;
float sensor_uv_voltage = 0;
float sensor_uv_intensity = 0;
bool motor = false;
int count_motor = 0;
bool uv_led = false;
int exposition_time_sun = 0;
float conductivity_electrolyte = 0;
float ph_ground_sensor = 0;

//////////variable bluetooth
volatile bool startBLERequested = false;
bool bleStarted = false;

unsigned long lastActivity = 0; 
const unsigned long BLE_TIMEOUT = 120000; 

NimBLECharacteristic* notifyChr;

String json_id_op_url = "";

int id_object = 1;
String id_object_profile = "";

////var blink led //
volatile bool ledBlinking = false; 
bool ledBlinkingVar = false;


//// var control //
bool activateBle = false;


////////// End variable bluetooth

// retrieve from database

int lightSensorData = 0;
bool isWillWateringData = false;
bool isAutomaticData = true;
int stateData = 0;

// patch to database

int lightSensorDataPatch = 0;
bool isWillWateringDataPatch = false;


// ======= CONFIGURATION  WIFI=======
String wifi_ssid = "";
String wifi_password = "";
String base_url = "";


// ======= CONFIGURATION  WIFI=======
//const char* WIFI_SSID = "C42";
//const char* WIFI_PASSWORD = "56025602";

//const char* SERVER_IP = "192.168.94.165";
//const int SERVER_PORT = 3000;
//const char* OBJECT_ID = "1";

////// variable logic

const unsigned long BLINK_INTERVAL_LED_MOTOR = 500; // en millisecondes


bool greenLedState = false;
bool yellowLedState = false;
bool redLedState = false;

unsigned long lastBlinkTimeLedMotor = 0;

bool isButtonPressedR = false;
bool isButtonPressedW = false;


const unsigned long NETWORK_SEND_INTERVAL_PATCH_ALL = 1800000; // 30min
const unsigned long NETWORK_SEND_INTERVAL_GET_ALL = 3000; // 5s 

// Glosary func
void IRAM_ATTR onButtonPressedBluetooth();
void IRAM_ATTR onButtonPressedWater();
void IRAM_ATTR onButtonPressedUVLed();
void loadPreferences();

void setup() {
  Serial.begin(115200);

   loadPreferences();

  Serial.println("📂 Données chargées depuis la mémoire :");
  Serial.println("SSID: " + wifi_ssid);
  Serial.println("Password: " + wifi_password);
  Serial.println("ID Object Profile: " + id_object_profile);
  Serial.println("Base URL: " + base_url);


  // INPUT
  pinMode(SENSOR_TEMPERATURE_GROUND_P, INPUT);
  pinMode(SENSOR_WATER_P, INPUT);
  pinMode(SENSOR_HUMIDITY_GROUND, INPUT);
  pinMode(SENSOR_TEMPERATURE_HUMIDITY_EXTERN, INPUT);
  pinMode(SENSOR_UV, INPUT);
  pinMode(MOTOR, OUTPUT);
  pinMode(UVLED, OUTPUT);
  pinMode(LED_PIN_BLUE, OUTPUT);
  pinMode(LED_PIN_GREEN, OUTPUT);
  pinMode(LED_PIN_RED, OUTPUT);
  pinMode(LED_PIN_YELLOW, OUTPUT);
  pinMode(BUTTON_PIN_BLUETOOTH, INPUT_PULLUP);
  pinMode(BUTTON_PIN_RED_WATER, INPUT_PULLUP);
  pinMode(BUTTON_PIN_WHITE_UV_LED, INPUT_PULLUP);

  // Création sensor temperature humidity extern
  dht.begin();

  sensors.begin();


  ///////////// Bluetooth task ////////////////

  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN_BLUETOOTH), onButtonPressedBluetooth, FALLING);

  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN_RED_WATER), onButtonPressedWater, FALLING);

  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN_WHITE_UV_LED), onButtonPressedUVLed, FALLING);

  xTaskCreate(taskPatchDynamic, "Patch after press button", 10000, NULL, 1, NULL);
  
  xTaskCreate(taskBleUse, "BLE Task", 8192, NULL, 1, NULL);

  xTaskCreate(taskLedBlink, "LED Blink Task", 8192, NULL, 1, NULL);

  xTaskCreate(taskPushIdObject, "Push id object Task", 8192, NULL, 1, NULL);

  /////////////////////// End for bluetooth ///////////////

  // get object from databse
  xTaskCreate(taskGetAllDataBase, "HTTP Get findOne", 8192, NULL, 1, NULL);

  // update databse
  xTaskCreate(taskPatchDataBase, "HTTP Patch", 8192, NULL, 1, NULL);

  //get variable sensor temperature ground
  xTaskCreate(taskGetSensorTemperatureGround, "Temperature ground sensor", 4096, NULL, 1, NULL);

  //get variable sensor water level
  xTaskCreate(taskGetSensorWater, "Water level sensor", 4096, NULL, 1, NULL);

  //get variable sensor humidity ground
  xTaskCreate(taskGetSensorHumidityGround, "Humidity ground sensor", 4096, NULL, 1, NULL);

  //get variable temperature humidity extern
  xTaskCreate(taskGetSensorTemperatureHumidityExtern, "Temperature humidity extern sensor", 4096, NULL, 1, NULL);

  //get variable uv sensor and voltage
  xTaskCreate(taskGetSensorUVVoltage, "UV and voltage sensor", 4096, NULL, 1, NULL);

  // function motor 
  xTaskCreate(taskGetMotor, "Pression motor", 8192, NULL, 1, NULL);

  // function UV led 
  xTaskCreate(taskGetUVLed, "UV Led", 8192, NULL, 1, NULL);

  // function information led 
  xTaskCreate(taskGetInformationLed, "Information Led", 8192, NULL, 1, NULL);

    
}

///////// Load Preferences for flash memory ////////
void loadPreferences() {
  Preferences prefs;

  prefs.begin("save_data", true);
  wifi_ssid = prefs.getString("ssid", "");
  wifi_password = prefs.getString("pass", "");
  json_id_op_url = prefs.getString("json_id_op_url", "");
  prefs.end();

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, json_id_op_url); // ✅ ici c'est json_id_op_url

  if (!error) {
    if (doc.containsKey("id_object_profile")) {
      id_object_profile = doc["id_object_profile"].as<String>();
    }
    if (doc.containsKey("base_url")) {
      base_url = doc["base_url"].as<String>();
    }
  } else {
    Serial.println("❌ Erreur de parsing JSON depuis la mémoire");
  }
}



////////////// For communication WIFI ///////////////////////////////////

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("🔌 Connexion WiFi perdue. Tentative de reconnexion...");
    WiFi.begin(wifi_ssid, wifi_password);

    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
      delay(500);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✅ Reconnecté au WiFi !");
    } else {
      Serial.println("\n❌ Impossible de se reconnecter.");
    }
  }
}


// For Patch http request
void sendPatchRequest(String endpoint, const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("📴 Pas de WiFi, requête ignorée.");
    return;
  }

  HTTPClient http;
  String url = base_url + endpoint;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  Serial.println("📤 Envoi PATCH vers : " + url);
  Serial.println("📦 Payload : " + jsonPayload);

  int httpResponseCode = http.sendRequest("PATCH", jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("✅ Réponse HTTP : ");
    Serial.println(httpResponseCode);
    Serial.println("📝 " + http.getString());
  } else {
    Serial.print("❌ Erreur HTTP : ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

void taskPatchDataBase(void* parameter) {
  while (true) {
    if (activateBle == false){
      PatchDataBase();
    }

    vTaskDelay(NETWORK_SEND_INTERVAL_PATCH_ALL / portTICK_PERIOD_MS);
  }
}

void PatchDataBase(){
  checkWiFiConnection();

     if (WiFi.status() == WL_CONNECTED && id_object_profile != "") {

          // Construction du JSON
          String payload = "{";
          payload += "\"humidityAirSensor\":" + String(sensor_extern_humidity, 2) + ",";
          payload += "\"humidityGroundSensor\":" + String(sensor_ground_humidity, 2) + ",";
          payload += "\"phGroundSensor\":" + String(ph_ground_sensor, 2) + ",";
          payload += "\"conductivityElectriqueFertilitySensor\":" + String(conductivity_electrolyte, 2) + ",";
          payload += "\"lightSensor\":" + String(lightSensorDataPatch ? 1 : 0) + ",";
          payload += "\"temperatureSensorGround\":" + String(sensor_temprature_ground, 2) + ",";
          payload += "\"temperatureSensorExtern\":" + String(sensor_extern_temperature, 2) + ",";
          payload += "\"expositionTimeSun\":" + String(exposition_time_sun) + ",";
          payload += "\"water_sensor\":" + String(sensor_water_level, 2)+ ",";
          payload += "\"isWillWatering\":" + String(isWillWateringDataPatch ? "true" : "false");
          payload += "}";
      
          sendPatchRequest("/object-profile-elec/" + id_object_profile, payload);
     }
}

// Get all from database
void fetchObjectProfileData() {
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("📴 Pas de WiFi, requête ignorée.");
    return;
  }

  HTTPClient http;
  String url = base_url + "/object-profile-elec/" + id_object_profile;
Serial.println("URL GET: " + url);
  http.begin(url);
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    String payload = http.getString();
    Serial.println("✅ Données reçues de l’API :");
    Serial.println(payload);
    parseObjectProfileData(payload);
  } else {
    Serial.print("❌ Erreur HTTP GET : ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

void parseObjectProfileData(String payload) {
  StaticJsonDocument<1024> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.println("❌ Erreur de parsing JSON dans parseObjectProfileData()");
    return;
  }

  if (doc.containsKey("lightSensor")) {
    lightSensorData = doc["lightSensor"].as<int>();
    Serial.println("🔆 lightSensorData = " + String(lightSensorData));
  }

  if (doc.containsKey("isWillWatering")) {
    isWillWateringData = doc["isWillWatering"].as<bool>();
    Serial.println("💧 isWillWateringData = " + String(isWillWateringData));
  }

  if (doc.containsKey("isAutomatic")) {
    isAutomaticData = doc["isAutomatic"].as<bool>();
    Serial.println("🤖 isAutomaticData = " + String(isAutomaticData));
  }

  if (doc.containsKey("state")) {
    stateData = doc["state"].as<int>();
    Serial.println("🔁 stateData = " + String(stateData));
  }
}


void taskGetAllDataBase(void* parameter) {
  while (true) {
     if (activateBle == false){
        checkWiFiConnection();
        
        if (WiFi.status() == WL_CONNECTED && id_object_profile != "") {
          fetchObjectProfileData();
        }
     }

    vTaskDelay(NETWORK_SEND_INTERVAL_GET_ALL / portTICK_PERIOD_MS);
  }
}



////////////// Get variable sensor ///////////////////////////////////

///// Get Temperature ground /////
void taskGetSensorTemperatureGround(void * parameter) {
  while (1) {
    if(activateBle == false){
      handleGetSensorTemperatureGround();
    }
    
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetSensorTemperatureGround() {
  sensors.requestTemperatures(); // ask mesure
  float sensor_temprature_ground_p = sensors.getTempCByIndex(0); // read temperature from first sensor
  
  if (sensor_temprature_ground_p == DEVICE_DISCONNECTED_C) {
    sensor_temprature_ground_p = 0;
    Serial.println("❌ Capteur non détecté !");
  } else {
    sensor_temprature_ground = sensor_temprature_ground_p;
    Serial.print("🌡️ Température du sol : ");
    Serial.print(sensor_temprature_ground_p);
    Serial.println(" °C");
  }
}


///// Get water level /////
void taskGetSensorWater(void * parameter) {
  while (1) {
     if(activateBle == false){
        handleGetSensorWater();
     }
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetSensorWater() {
  sensor_water_level = analogRead(SENSOR_WATER_P); // Lecture de l'entrée analogique

  Serial.print("Valeur capteur d'eau : ");
  Serial.println(sensor_water_level); // Affiche la valeur brute (0–1023 ou 0–1024 selon board)


  if (sensor_water_level > 300) {
    Serial.println("💧 Eau détectée !");
  } else {
    Serial.println("🌵 Sol sec ou capteur sec.");
  }
}

///// Get humidity ground /////
void taskGetSensorHumidityGround(void * parameter) {
  while (1) {
    if(activateBle == false){
      handleGetSensorHumidityGround();
    }
    
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetSensorHumidityGround() {
  sensor_ground_humidity = analogRead(SENSOR_HUMIDITY_GROUND);

    // Affichage des résultats
    Serial.print(" %, Sol (capacitif): ");
    Serial.println(sensor_ground_humidity);
}


///// Get temperature humidity extern /////
void taskGetSensorTemperatureHumidityExtern(void * parameter) {
  while (1) {
    if(activateBle == false){
      handleGetSensorTemperatureHumidityExtern();
    }
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetSensorTemperatureHumidityExtern() {
  sensor_extern_temperature = dht.readTemperature();
  sensor_extern_humidity = dht.readHumidity();
  

  if (isnan(sensor_extern_temperature) || isnan(sensor_extern_humidity)) {
    Serial.println("Erreur de lecture capteur DHT11 !");
    sensor_extern_temperature = 0;
    sensor_extern_humidity = 0;
    
  } else {
    Serial.print("Température : ");
    Serial.print(sensor_extern_temperature);
    Serial.print(" °C | Humidité : ");
    Serial.print(sensor_extern_humidity);
    Serial.println(" %");
  }
}


///// Get UV and voltage /////
void taskGetSensorUVVoltage(void * parameter) {
  while (1) {
    if(activateBle == false){
      handleGetSensorUVVoltage();
    }
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetSensorUVVoltage() {
  int raw_uv = analogRead(SENSOR_UV);
  
  // Conversion tension ESP32 => 0–4095, 3.3V)
  sensor_uv_voltage = raw_uv * (3.3 / 4095.0);

  // Approximation UV index
  sensor_uv_intensity = sensor_uv_voltage * 10.0;

  Serial.print("Tension : ");
  Serial.print(sensor_uv_voltage, 2);
  Serial.print(" V | Indice UV approx. : ");
  Serial.println(sensor_uv_intensity, 1);

}


///// Get Motor /////
void taskGetMotor(void * parameter) {
  while (1) {
    if(activateBle == false){
      handleGetMotor();
    }
    vTaskDelay(2000 / portTICK_PERIOD_MS); // Delay 5 second
  }
}


void handleGetMotor() {

  if(isWillWateringData){
    isWillWateringDataPatch = false;
    Serial.println("💧 Début arrosage (déclenché par isWillWateringData)");
    PatchDataBase();
    motor = true;
  }
  
  digitalWrite(MOTOR, motor);

  if (motor) {
    count_motor += 1;
  
    if (count_motor == 6) {
      count_motor = 0;
      motor = false;
    }
  }

  Serial.print("Motor : ");
  Serial.println(motor);

}


///// Get UV Led /////

void taskGetUVLed(void * parameter) {
  while (1) {
    if(activateBle == false){
      handleGetUVLed();
    }
    vTaskDelay(1000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetUVLed() {
  
  digitalWrite(UVLED, lightSensorData); 
  Serial.println("HOLSODKOSJDJCKDSJOCDSC?DSOCJDSOJ3 : " + lightSensorData);


}

///// Get Information Led /////

void taskGetInformationLed(void * parameter) {
  while (1) {
    if(activateBle == false){
      handleGetInformationLed();
    }
    vTaskDelay(1000 / portTICK_PERIOD_MS); 
  }
}

void handleGetInformationLed() {
  unsigned long currentTime = millis();

  // Réinitialisation des états des LEDs
  bool green = LOW;
  bool yellow = LOW;
  bool red = LOW;

  if (stateData < 5) {
    if (isAutomaticData) {
      Serial.println("T'es vert !");
      green = motor ? getBlinkState(currentTime) : HIGH;
    } else {
      Serial.println("T'es jaune !");
      yellow = motor ? getBlinkState(currentTime) : HIGH;
    }
  } else {
    Serial.println("T'es rouge !");
    red = motor ? getBlinkState(currentTime) : HIGH;
  }

  // Appliquer les états calculés
  digitalWrite(LED_PIN_GREEN, green);
  digitalWrite(LED_PIN_YELLOW, yellow);
  digitalWrite(LED_PIN_RED, red);
}

bool getBlinkState(unsigned long currentTime) {
  if (currentTime - lastBlinkTimeLedMotor >= BLINK_INTERVAL_LED_MOTOR) {
    lastBlinkTimeLedMotor = currentTime;
    greenLedState = !greenLedState; // un seul état partagé pour le clignotement
  }
  return greenLedState ? HIGH : LOW;
}

/////////

//// Button configuration/////

void IRAM_ATTR onButtonPressedWater() {
  Serial.println("Press red");
  isButtonPressedR = true;
  
}

void IRAM_ATTR onButtonPressedUVLed() {
  Serial.println("Press white");
  isButtonPressedW = true;
}

void taskPatchDynamic(void* parameter) {
  while (true) {

    if(activateBle == false){
       Serial.println("HOLA !");
      if (isButtonPressedR){
        Serial.println("Enter task R");
        isButtonPressedR = false;
        isWillWateringDataPatch = true;
      }
      
      if (isButtonPressedW){
        Serial.println("Enter task W");
        isButtonPressedW = false;
        lightSensorDataPatch = !lightSensorDataPatch;
      }
      PatchDataBase();
    }

    vTaskDelay(2000 / portTICK_PERIOD_MS);
  }
}




//// End Button configuration////

/////////////////////////////////////// Bluetooth configuration ///////////////////////////////////
// ==== ISR ====
void IRAM_ATTR onButtonPressedBluetooth() {
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
      digitalWrite(LED_PIN_BLUE, LOW);
    } else if (value == "stopBle") {
        stopBLE();
    } else {
      
      // On tente de parser comme un JSON
      StaticJsonDocument<1048> doc;
      DeserializationError error = deserializeJson(doc, value);

      if (!error) {
        Preferences prefs;
        
        if (doc.containsKey("wifi_user") && doc.containsKey("wifi_password")) {
          wifi_ssid = doc["wifi_user"].as<String>();
          wifi_password = doc["wifi_password"].as<String>();

          Serial.println("✅ Identifiants Wi-Fi reçus :");
          Serial.println("SSID: " + wifi_ssid);
          Serial.println("Password: " + wifi_password);


          bool wifiOk = testWiFiConnection(wifi_ssid, wifi_password);

          String result = wifiOk ? "wifi_ok" : "wifi_fail";

          if (result == "wifi_ok"){
            // Sauvegarde en NVS
            prefs.begin("save_data", false); // false = écriture
            prefs.putString("ssid", wifi_ssid);
            prefs.putString("pass", wifi_password);
            prefs.end();

            Preferences prefs;
            prefs.begin("save_data", true);
            wifi_ssid = prefs.getString("ssid", "");
            wifi_password = prefs.getString("pass", "");
            prefs.end();

            
          }

          if (result == "wifi_ok" && id_object_profile != ""){
            Serial.println("id----: " + result);
            result = "{ \"id_object_profile\": \"" + id_object_profile + "\" }";
            Serial.println("id----: " + result);
          }
          
          notifyChr->setValue(result.c_str());
          notifyChr->notify();

          
        }
        
        // Dans le callback BLE
        if (doc.containsKey("id_object_profile") && doc.containsKey("base_url")) {
            
            String jsonString;
            serializeJson(doc, jsonString);
            prefs.begin("save_data", false);
            prefs.putString("json_id_op_url", jsonString); 
            prefs.end();

            id_object_profile = doc["id_object_profile"].as<String>();
            base_url = doc["base_url"].as<String>();
           
   
        
            Serial.println("💾 Données sauvegardées avec succès !");
            
            String result = String(id_object);
            notifyChr->setValue(result.c_str());
            notifyChr->notify();

            ledBlinking = false;
            digitalWrite(LED_PIN_BLUE, LOW);
        }
      }else {
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
    digitalWrite(LED_PIN_BLUE, HIGH);
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
  ledBlinking = false;
  digitalWrite(LED_PIN_BLUE, LOW);
  bleStarted = false;
  Serial.println("activateBle FAlse.");
  activateBle = false;
}

// ==== BLE TASK ====
void taskBleUse(void * parameter) {
  while (1) {
    if (startBLERequested && !bleStarted) {
      startBLERequested = false;
      Serial.println("activateBle TRue.");
      activateBle = true;
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

///////// Task //////////

/// LED //////////

void taskLedBlink(void *parameter) {
  bool previousBlinkState = false;

  while (1) {
    if (ledBlinking) {
      digitalWrite(LED_PIN_BLUE, ledBlinkingVar);
      ledBlinkingVar = !ledBlinkingVar;
    } else if (previousBlinkState) {
      // On vient de passer de ON à OFF, on éteint proprement la LED
      digitalWrite(LED_PIN_BLUE, LOW);
      ledBlinkingVar = false;  // Réinitialise la variable
    }

    previousBlinkState = ledBlinking;
    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}

/// Push id_object //////////

void taskPushIdObject(void *parameter) {
  while (1) {
    if (bleStarted) {
      String msg = String(id_object);
      notifyChr->setValue(msg.c_str());
      notifyChr->notify();
      Serial.println("📤 Envoyé : " + msg);

    }
    
    vTaskDelay(3000 / portTICK_PERIOD_MS);
  }
}


////////////////////

////// TEST WIFI ////////
bool testWiFiConnection(const String& ssid, const String& password) {
  WiFi.disconnect(true, true); 
  delay(200);                  
  WiFi.mode(WIFI_STA);         
  delay(100);         
  WiFi.begin(ssid.c_str(), password.c_str());

  Serial.println("🔌 Connexion Wi-Fi en cours...");

  unsigned long startAttemptTime = millis();
  const unsigned long timeout = 15000; // 10 secondes

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


/////////////////////////////////////// End Bluetooth configuration ///////////////////////////////////



void loop() {
}
