#include <M5Unified.h>
#include "CardScanner.h"
#include "SysModeManager.h"
#include "SysTouchManager.h"

CardScanner _CardScanner;


void setup() 
{
  // System
  auto cfg = M5.config();
  M5.begin(cfg);
  M5.Power.begin();
  Serial.begin(115200);
  delay(500);
  Wire.begin();
  delay(500);

  _CardScanner.setup();
}


void loop() 
{
  M5.update();
  SysTouchManager::getInstance().update();
  SysModeManager::getInstance().update();
  SysModeManager::getInstance().draw();
}
