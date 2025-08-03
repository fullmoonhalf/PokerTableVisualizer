#include "CardScanner.h"
#include "SysModeManager.h"

CardScanner _CardScanner;


void setup() 
{
  _CardScanner.setup();
}


void loop() 
{
  SysModeManager::getInstance().update();
  SysModeManager::getInstance().draw();
}
