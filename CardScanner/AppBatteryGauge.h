#ifndef _INCLUDED_APP_BATTERY_GAUGE
#define _INCLUDED_APP_BATTERY_GAUGE
#include "SysSprite.h"
#include "SysGuiGauge.h"
#include "AppBLEProtocolBatteryInfo.h"


class AppBatteryGauge : public SysDrawable, public IAppBLEProtocolBatteryInfo
{
public:
    AppBatteryGauge();
    ~AppBatteryGauge();

    virtual void draw(int x, int y);
    void update();
    int getWidth();
    int getHeight();
    virtual int getBatteryLevel();
    virtual bool isCharging();

private:
    SysGuiGauge *_Gauge;
    SysSprite *_Label;
    int _CurrentBatteryLevel;
};


#endif // _INCLUDED_APP_BATTERY_GAUGE
