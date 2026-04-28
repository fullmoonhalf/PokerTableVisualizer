#ifndef _INCLUDED_APP_BATTERY_GAUGE
#define _INCLUDED_APP_BATTERY_GAUGE
#include "SysSprite.h"
#include "SysGuiGauge.h"


class AppBatteryGauge : public SysDrawable
{
public:
    AppBatteryGauge();
    ~AppBatteryGauge();

    virtual void draw(int x, int y);
    void update();
    int getWidth();
    int getHeight();
    int getBatteryLevel();
    bool isCharging();

private:
    SysGuiGauge *_Gauge;
    SysSprite *_Label;
    int _CurrentBatteryLevel;
};


#endif // _INCLUDED_APP_BATTERY_GAUGE
