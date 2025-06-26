
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
float sensor_water_level = 0;
float sensor_ground_humidity = 0;
float sensor_extern_temperature = 0;
float sensor_extern_humidity = 0;
float sensor_uv_voltage = 0;
float sensor_uv_intensity = 0;
bool motor = false;
bool uv_led = false;


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
  int sensor_ground_humidity = analogRead(SENSOR_HUMIDITY_GROUND);

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
