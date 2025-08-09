#ifndef _INCLUDED_CARD_SCANNER_H
#define _INCLUDED_CARD_SCANNER_H
#include "SysDisplay.h"
#include "SysSetting.h"
#include "SysMode.h"

class CardScanner : public SysMode
{
public:
    void setup();
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();

private:
    SysSetting _Setting;
    int _FrameCount = 0;
};



#endif // _INCLUDED_CARD_SCANNER_H