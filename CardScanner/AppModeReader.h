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
    void start_indicator();
    void update_indicator();

private: // センサーまわり
    AppCardListenerUnitRfid2Base *_CardReader;
    int _SensorCount;

private: // BLE まわり
    SysBLEControl *_BLEController;
    char _SendInfoBuffer[480];
    char _ProbeName[64];
    char _BLE_identifier[64];
    char _BLE_service_uuid[64];
    char _BLE_characteristics_uuid[64];

private: // 表示まわり
    SysGuiGauge *_GaugeBattery;
    SysSprite *_LabelBattery;
    SysSprite *_LabelSeat;
    SysSprite *_LabelBLEStatus;
    SysSprite *_LabelSensorHeader;
    SysSprite *_LabelSensorStatus[8];

    int _GaugeBatteryPosX;
    int _GaugeBatteryPosY;
    int _LabelBatteryPosX;
    int _LabelSeatPosX;
    int _LabelSeatPosY;
    int _LabelBLEPosX;
    int _LabelBLEPosY;
    int _LabelSensorPosX;
    int _LabelSensorPosY;
};


#endif // _INCLUDED_APP_MODE_READER
