#ifndef _INCLUDED_CARD_SCANNER_H
#define _INCLUDED_CARD_SCANNER_H
#include "SysDisplay.h"
#include "SysSetting.h"

class CardScanner
{
public:
    void setup();
    void update();

private:
    SysDisplay _Display;
    SysSetting _Setting;
    int _FrameCount = 0;
};



#endif // _INCLUDED_CARD_SCANNER_H