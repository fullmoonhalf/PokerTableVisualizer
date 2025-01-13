#ifndef APP_STATUS_PANEL_H
#define APP_STATUS_PANEL_H
#include <M5Unified.h>
#include "AppDisplay.h"
#include "GuiGauge.h"

class AppStatusPanel
{
public:
    AppStatusPanel(AppDisplay *display);
    void init();
    void update();
    void draw(int x, int y);

private:
    AppDisplay *_Display;
    GuiGauge *_GaugeBattery;
};


#endif /* APP_STATUS_PANEL_H */
