#ifndef _INCLUDED_APP_MODE_READER
#define _INCLUDED_APP_MODE_READER
#include "SysMode.h"
#include "SysGuiGauge.h"
#include "SysBLEControl.h";
#include "AppCardListenerUnitRfid2.h"



class AppModeReader : public SysMode
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();

private:
    AppCardListenerUnitRfid2 *_CardReader;
    SysBLEControl *_BLEController;
    SysGuiGauge *_GaugeBattery;
    char _SendInfoBuffer[480];
    char _ProbeName[64];
    char _BLE_identifier[64];
    char _BLE_service_uuid[64];
    char _BLE_characteristics_uuid[64];
    int _GaugeBatteryPosX;
    int _GaugeBatteryPosY;
};


#endif // _INCLUDED_APP_MODE_READER
