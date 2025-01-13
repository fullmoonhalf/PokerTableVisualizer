#ifndef APP_STATUS_PANEL_H
#define APP_STATUS_PANEL_H
#include <M5Unified.h>
#include "AppDisplay.h"
#include "UhfRfidDriver.h"
#include "GuiGauge.h"
#include "AppReporter.h"


class AppStatusPanel
{
public:
    AppStatusPanel(AppDisplay *display);
    void setup();
    void update();
    void draw(int x, int y);
    void dumpMemoryStatus();

    void bind(UhfRfidDriver *rfid_driver);
    void bind(AppReporter *reporter);

private:
    AppDisplay *_Display;
    UhfRfidDriver *_RfidDriver;
    AppReporter *_Reporter;

    GuiGauge *_GaugeBattery;
    LGFX_Sprite *_SpriteRfid;
    LGFX_Sprite *_SpriteReporter;
};


#endif /* APP_STATUS_PANEL_H */
