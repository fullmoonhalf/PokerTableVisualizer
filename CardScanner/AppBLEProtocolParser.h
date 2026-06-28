#ifndef _INCLUDED_APP_BLE_PROTOCOL_PARSER
#define _INCLUDED_APP_BLE_PROTOCOL_PARSER
#include "SysBLEControl.h"
#include "AppBLEProtocolBatteryInfo.h"


class AppBLEProtocolParser
{
public:
    AppBLEProtocolParser();

    void setProbeName(const char *probe_name);
    void bindBatteryInfo(IAppBLEProtocolBatteryInfo *battery_info);
    void bindBLEController(SysBLEControl *ble_controller);
    
    void beginConstruction();
    void addKeyObject(const char *key, const char *value);
    void addKeyValue(const char *key, const char *value);
    void addKeyValue(const char *key, int value);
    void endConstruction();

private:
    char _SendInfoBuffer[480];
    char _ProbeName[64];
    char *_Seek;
    const char *_Delim;
    SysBLEControl *_BLEController;
    IAppBLEProtocolBatteryInfo *_BatteryInfo;
};


#endif // _INCLUDED_APP_BLE_PROTOCOL_PARSER
