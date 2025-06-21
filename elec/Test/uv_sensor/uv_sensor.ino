#define sensorPin 32

float voltage;
float uvIntensity;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(sensorPin);
  
  // Conversion tension ESP32 => 0–4095, 3.3V)
  voltage = raw * (3.3 / 4095.0);

  // Approximation UV index
  uvIntensity = voltage * 10.0;

  Serial.print("Tension : ");
  Serial.print(voltage, 2);
  Serial.print(" V | Indice UV approx. : ");
  Serial.println(uvIntensity, 1);

  delay(1000);
}
