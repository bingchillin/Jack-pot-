#define PIN_CAPTEUR  35

void setup() {
  Serial.begin(115200);
  pinMode(PIN_CAPTEUR, INPUT);
}

void loop() {
    int valeurCap = analogRead(PIN_CAPTEUR);

    // Affichage des résultats
    Serial.print(" %, Sol (capacitif): ");
    Serial.println(valeurCap);
  

  delay(2000); 
}
