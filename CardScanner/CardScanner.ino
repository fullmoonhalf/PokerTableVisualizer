#include "CardScanner.h"


CardScanner _CardScanner;


void setup() 
{
  _CardScanner.setup();
}


void loop() 
{
  _CardScanner.update();
}
