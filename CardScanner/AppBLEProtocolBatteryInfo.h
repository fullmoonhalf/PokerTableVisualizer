#ifndef _INCLUDED_APP_BLE_PROTOCOL_BATTERY_INFO
#define _INCLUDED_APP_BLE_PROTOCOL_BATTERY_INFO


class IAppBLEProtocolBatteryInfo
{
public:
    virtual int getBatteryLevel() = 0;
    virtual bool isCharging() = 0;
};


#endif // _INCLUDED_APP_BLE_PROTOCOL_BATTERY_INFO
