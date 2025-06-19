#include "DHT.h"

#define DHTPIN 14
#define DHTTYPE DHT11   

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float humidite = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidite) || isnan(temperature)) {
    Serial.println("Erreur de lecture capteur DHT11 !");
  } else {
    Serial.print("Température : ");
    Serial.print(temperature);
    Serial.print(" °C | Humidité : ");
    Serial.print(humidite);
    Serial.println(" %");
  }
  delay(2000);
}
