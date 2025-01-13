#ifndef APP_STATUS_PANEL_H
#define APP_STATUS_PANEL_H
#include <M5Unified.h>
#include "AppDisplay.h"
#include "UhfRfidDriver.h"
#include "GuiGauge.h"



class AppStatusPanel
{
public:
    AppStatusPanel(AppDisplay *display, UhfRfidDriver *rfid_driver);
    void init();
    void update();
    void draw(int x, int y);

private:
    AppDisplay *_Display;
    UhfRfidDriver *_RfidDriver;

    GuiGauge *_GaugeBattery;
    LGFX_Sprite *_SpriteRfid;
};


#endif /* APP_STATUS_PANEL_H */
