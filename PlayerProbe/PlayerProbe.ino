#include <M5Core2.h>
#include "BluetoothSerial.h"


BluetoothSerial bts;


void setup() {
  // put your setup code here, to run once:
  M5.begin();
  Serial.begin(9600);
  bts.begin("MSR IoT Device"); // specify bluettooth device
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.setTextSize(1);
  M5.Lcd.setTextDatum(4);
}

void loop() {
  // put your main code here, to run repeatedly:
  int value = random(0, 1000);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.drawNumber(value, 160, 120, 8);
  bts.println(value);
  delay(1000);
}
