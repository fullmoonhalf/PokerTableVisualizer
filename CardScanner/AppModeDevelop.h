#ifndef _INCLUDED_APP_MODE_DEVELOP
#define _INCLUDED_APP_MODE_DEVELOP
#include "SysMode.h"
#include "SysGuiGauge.h"
#include "AppCardListenerUnitRfid2Base.h"


class AppModeDevelop : public SysMode
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();

private:
    SysGuiGauge *_Gauge;
    AppCardListenerUnitRfid2Base *_CardReader;
    int _FrameCount;
};


#endif // _INCLUDED_APP_MODE_DEVELOP
