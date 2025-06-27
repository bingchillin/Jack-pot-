
// WIFI communication
#include <WiFi.h>
#include <HTTPClient.h>


//sensor temperature ground
#include <OneWire.h>
#include <DallasTemperature.h>

// sensor temperature humidity extern
#include "DHT.h"

// PIN
#define SENSOR_TEMPERATURE_GROUND_P 15
#define SENSOR_WATER_P 34
#define SENSOR_HUMIDITY_GROUND  35
#define SENSOR_TEMPERATURE_HUMIDITY_EXTERN 14
#define SENSOR_UV 32
#define MOTOR 16
#define UVLED 18

// sensor temperature humidity extern
#define DHTTYPE DHT11   


// configure sensor temperature ground
OneWire sensor_temprature_ground_p(SENSOR_TEMPERATURE_GROUND_P);

// Création sensor for temperature ground
DallasTemperature sensors(&sensor_temprature_ground_p);

// configure sensor temperature humidity extern
DHT dht(SENSOR_TEMPERATURE_HUMIDITY_EXTERN, DHTTYPE);

//variable sensor
float sensor_temprature_ground = 0;
float sensor_water_level = 0;
float sensor_ground_humidity = 0;
float sensor_extern_temperature = 0;
float sensor_extern_humidity = 0;
float sensor_uv_voltage = 0;
float sensor_uv_intensity = 0;
bool motor = false;
bool uv_led = false;
int exposition_time_sun = 0;
float conductivity_electrolyte = 0;
float ph_ground_sensor = 0;

// ======= CONFIGURATION  WIFI=======
const char* WIFI_SSID = "C42";
const char* WIFI_PASSWORD = "56025602";

const char* SERVER_IP = "192.168.94.165";
const int SERVER_PORT = 3000;
const char* OBJECT_ID = "1";

const unsigned long NETWORK_SEND_INTERVAL = 30000; // 30s



void setup() {
  Serial.begin(115200);

  // INPUT
  pinMode(SENSOR_TEMPERATURE_GROUND_P, INPUT);
  pinMode(SENSOR_WATER_P, INPUT);
  pinMode(SENSOR_HUMIDITY_GROUND, INPUT);
  pinMode(SENSOR_TEMPERATURE_HUMIDITY_EXTERN, INPUT);
  pinMode(SENSOR_UV, INPUT);
  pinMode(MOTOR, OUTPUT);
  pinMode(UVLED, OUTPUT);

  // Création sensor temperature humidity extern
  dht.begin();

  sensors.begin();

  // for wifi communication
  WiFi.begin("C42", "56025602");

  // Démarre la tâche réseau après les autres
  xTaskCreate(taskPatchDataBase, "HTTP Sender", 8192, NULL, 1, NULL);

  //get variable sensor temperature ground
  xTaskCreate(taskGetSensorTemperatureGround, "Temperature ground sensor", 4096, NULL, 1, NULL);

  //get variable sensor water level
  xTaskCreate(taskGetSensorWater, "Water level sensor", 4096, NULL, 1, NULL);

  //get variable sensor water level
  xTaskCreate(taskGetSensorHumidityGround, "Humidity ground sensor", 4096, NULL, 1, NULL);

  //get variable temperature humidity extern
  xTaskCreate(taskGetSensorTemperatureHumidityExtern, "Temperature humidity extern sensor", 4096, NULL, 1, NULL);

  //get variable uv sensor and voltage
  xTaskCreate(taskGetSensorUVVoltage, "UV and voltage sensor", 4096, NULL, 1, NULL);

  // function motor 
  xTaskCreate(taskGetMotor, "Pression motor", 4096, NULL, 1, NULL);

  // function UV Led 
  xTaskCreate(taskGetUVLed, "UV Led", 4096, NULL, 1, NULL);

    
}



////////////// For communication WIFI ///////////////////////////////////

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("🔌 Connexion WiFi perdue. Tentative de reconnexion...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

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

void sendPatchRequest(String endpoint, const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("📴 Pas de WiFi, requête ignorée.");
    return;
  }

  HTTPClient http;
  String url = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + endpoint;

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
    checkWiFiConnection();

     if (WiFi.status() == WL_CONNECTED) {

          // Construction du JSON
          String payload = "{";
          payload += "\"humidityAirSensor\":" + String(sensor_extern_humidity, 2) + ",";
          payload += "\"humidityGroundSensor\":" + String(sensor_ground_humidity, 2) + ",";
          payload += "\"phGroundSensor\":" + String(ph_ground_sensor, 2) + ",";
          payload += "\"conductivityElectriqueFertilitySensor\":" + String(conductivity_electrolyte, 2) + ",";
          payload += "\"lightSensor\":" + String(uv_led ? 1 : 0) + ",";
          payload += "\"temperatureSensorGround\":" + String(sensor_temprature_ground, 2) + ",";
          payload += "\"temperatureSensorExtern\":" + String(sensor_extern_temperature, 2) + ",";
          payload += "\"expositionTimeSun\":" + String(exposition_time_sun) + ",";
          payload += "\"water_sensor\":" + String(sensor_water_level, 2);
          payload += "}";
      
          sendPatchRequest("/object-profile-elec/" + String(OBJECT_ID), payload);
     }

    vTaskDelay(NETWORK_SEND_INTERVAL / portTICK_PERIOD_MS);
  }
}



////////////// Get variable sensor ///////////////////////////////////

///// Get Temperature ground /////
void taskGetSensorTemperatureGround(void * parameter) {
  while (1) {
    handleGetSensorTemperatureGround();
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
    handleGetSensorWater();
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
    handleGetSensorHumidityGround();
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
    handleGetSensorTemperatureHumidityExtern();
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
    handleGetSensorUVVoltage();
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
    handleGetMotor();
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetMotor() {
  
  digitalWrite(MOTOR, motor); 

  Serial.print("Motor : ");
  Serial.println(motor);

}


///// Get UV Led /////

void taskGetUVLed(void * parameter) {
  while (1) {
    handleGetUVLed();
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Delay 1 second
  }
}


void handleGetUVLed() {
  
  digitalWrite(UVLED, uv_led); 

  Serial.print("UV Led : ");
  Serial.println(uv_led);

}



void loop() {
   
}
