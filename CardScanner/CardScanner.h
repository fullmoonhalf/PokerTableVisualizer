#ifndef _INCLUDED_CARD_SCANNER_H
#define _INCLUDED_CARD_SCANNER_H
#include "SysDisplay.h"
#include "SysSetting.h"
#include "SysMode.h"
#include "SysGuiButton.h"

class CardScanner : public SysMode, public SysGuiButtonReaction
{
public:
    void setup();
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();
    virtual void onGUiButtonReleased(const char *label);

private:
    SysSetting _Setting;
    SysGuiButton *_ButtonReader;
    SysGuiButton *_ButtonWriter;
    SysGuiButton *_ButtonDevelop;
    int _FrameCount = 0;
};





#endif // _INCLUDED_CARD_SCANNER_H