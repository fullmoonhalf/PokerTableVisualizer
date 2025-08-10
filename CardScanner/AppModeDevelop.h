#ifndef _INCLUDED_APP_MODE_DEVELOP
#define _INCLUDED_APP_MODE_DEVELOP
#include "SysMode.h"
#include "SysGuiGauge.h"
#include "UnitRfid2Driver.h"


class AppModeDevelop : public SysMode
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();

private:
    SysGuiGauge *_Gauge;
    UnitRfid2Driver *_RfidDriver;
    int _FrameCount;
};


#endif // _INCLUDED_APP_MODE_DEVELOP
