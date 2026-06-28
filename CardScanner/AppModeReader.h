#ifndef _INCLUDED_APP_MODE_READER
#define _INCLUDED_APP_MODE_READER
#include "SysMode.h"
#include "SysGuiGauge.h"
#include "SysBLEControl.h"
#include "AppCardListenerUnitRfid2.h"
#include "AppBatteryGauge.h"
#include "AppBLEProtocolParser.h"


class AppModeReader : public SysMode, public SysBLECallbackRX
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();
    virtual void onBLEWrite(const char *buffer, int size);

private:
    void start_indicator();
    void update_indicator();
    void send(bool send_scan_data);

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

private: // 表示まわり
    AppBatteryGauge *_BatteryGauge;
    SysSprite *_LabelSeat;
    SysSprite *_LabelBLEStatus;
    SysSprite *_LabelMonitorStatus;
    SysSprite *_LabelSensorHeader;
    SysSprite *_LabelSensorStatus[8];

    int _GaugeBatteryPosX;
    int _GaugeBatteryPosY;
    int _LabelSeatPosX;
    int _LabelSeatPosY;
    int _LabelBLEPosX;
    int _LabelBLEPosY;
    int _LabelSensorPosX;
    int _LabelSensorPosY;
    int _LabelMonitorPosX;
    int _LabelMonitorPosY;
    int _Timeout;
    int _Idoltime;
    int _HeartbartInterval;
    uint32_t _LastMillis;
    uint32_t _ScreenSaveCounter;
    uint32_t _HeartbeatCounter;
    bool _Scannable;
};


#endif // _INCLUDED_APP_MODE_READER
