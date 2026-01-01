#ifndef _INCLUDED_CARD_SCANNER_H
#define _INCLUDED_CARD_SCANNER_H
#include "SysDisplay.h"
#include "SysSetting.h"
#include "SysMode.h"
#include "SysSprite.h"
#include "SysGuiButton.h"
#include "AppBatteryGauge.h"


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
    AppBatteryGauge *_BatteryGauge;
    SysGuiButton *_ButtonReader;
    SysGuiButton *_ButtonWriter;
    SysGuiButton *_ButtonDevelop;
    SysGuiButton *_ButtonDeckcheck;
    SysSprite *_LabelSeat;
    SysSprite *_LabelVersion;
    int _FrameCount = 0;
    int _GaugeBatteryPosX;
    int _GaugeBatteryPosY;
};





#endif // _INCLUDED_CARD_SCANNER_H