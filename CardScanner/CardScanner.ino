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

  // Serial 初期化
  Serial.begin(115200);
  delay(500); // 安定化させるのに必要

  // Wire の初期化
  Wire.begin();
  Wire.setClock(100000); // → 標準モード (100kHz) → ファストモード (400kHz)
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
