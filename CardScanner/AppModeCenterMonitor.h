#ifndef _INCLUDED_APP_MODE_CENTER_MONITOR
#define _INCLUDED_APP_MODE_CENTER_MONITOR
#include "SysMode.h"
#include "SysGuiGauge.h"
#include "SysBLEControl.h"
#include "AppCardListenerUnitRfid2.h"
#include "AppBatteryGauge.h"
#include "AppBLEProtocolParser.h"


class AppModeCenterMonitor : public SysMode, public SysBLECallbackRX
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();
    virtual void onBLEWrite(const char *buffer, int size);

private: // センサーまわり
    AppCardListenerUnitRfid2Base *_CardReader;
    int _SensorCount;

private: // BLE まわり
    SysBLEControl *_BLEController;
    AppBLEProtocolParser *_BLEProtocolParser;

    char _ProbeName[64];
    char _BLE_identifier[64];
    char _BLE_service_uuid[64];
    char _BLE_characteristics_tx_uuid[64];
    char _BLE_characteristics_rx_uuid[64];

    void send(bool send_scan_data);

private: // 表示まわり
    AppBatteryGauge *_BatteryGauge;
    int _GaugeBatteryPosX;
    int _GaugeBatteryPosY;

};


#endif // _INCLUDED_APP_MODE_CENTER_MONITOR
