#include "SysHardwareSpecification.h"


SysHardwareSpecification::SysHardwareSpecification()
{
}


int SysHardwareSpecification::getGpioPinIdForSdCardCs()
{
#if defined(ARDUINO_M5STACK_TAB5) || defined(ARDUINO_M5TAB5)
    return GPIO_NUM_42;
#else // for Core2 (Tentatively, for Core2, we use GPIO_NUM_4 as the SD card CS pin)    
    return GPIO_NUM_4;
#endif    
}
