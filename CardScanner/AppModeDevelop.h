#ifndef _INCLUDED_APP_MODE_DEVELOP
#define _INCLUDED_APP_MODE_DEVELOP
#include "SysMode.h"
#include "SysGuiGauge.h"
#include "UnitRfid2Driver.h"
#include "MFRC522_I2C.h"


class AppModeDevelop : public SysMode
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();

private:
    bool readOneCardOnce(MFRC522 *m);

    SysGuiGauge *_Gauge;
    MFRC522 *_MFRC522;
    int _FrameCount;
};


#endif // _INCLUDED_APP_MODE_DEVELOP
