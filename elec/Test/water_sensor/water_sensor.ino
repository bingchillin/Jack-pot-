
#define WATER_SENSOR_PIN 34 

void setup() {
   Serial.begin(115200);

}

void loop() {
  
  int value = analogRead(WATER_SENSOR_PIN); // Lecture de l'entrée analogique

  Serial.print("Valeur capteur d'eau : ");
  Serial.println(value); // Affiche la valeur brute (0–1023 ou 0–1024 selon board)


  if (value > 300) {
    Serial.println("💧 Eau détectée !");
  } else {
    Serial.println("🌵 Sol sec ou capteur sec.");
  }


  delay(1000);
}
