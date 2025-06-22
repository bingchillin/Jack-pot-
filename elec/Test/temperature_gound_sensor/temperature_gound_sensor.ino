#include <OneWire.h>
#include <DallasTemperature.h>

// Pin de données connecté au DS18B20 (via adaptateur)
#define ONE_WIRE_BUS 15

// Configuration du bus OneWire
OneWire oneWire(ONE_WIRE_BUS);

// Création de l’objet capteur
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  sensors.begin();  // Démarre le capteur
}

void loop() {
  sensors.requestTemperatures(); // Demande une mesure
  float temperature = sensors.getTempCByIndex(0); // Lit la température du 1er capteur (s’il y en a plusieurs)

  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("❌ Capteur non détecté !");
  } else {
    Serial.print("🌡️ Température du sol : ");
    Serial.print(temperature);
    Serial.println(" °C");
  }

  delay(2000); // Pause entre les mesures
}
