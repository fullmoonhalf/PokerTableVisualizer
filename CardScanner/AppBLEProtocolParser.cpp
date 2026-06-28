#include <stdio.h>
#include <string.h>
#include "AppBLEProtocolParser.h"


AppBLEProtocolParser::AppBLEProtocolParser()
    : _Seek(nullptr)
    , _BatteryInfo(nullptr)
    , _BLEController(nullptr)
    , _Delim("")
{
}


void AppBLEProtocolParser::setProbeName(const char *probe_name)
{
    strncpy(_ProbeName, probe_name, sizeof(_ProbeName) - 1);
    _ProbeName[sizeof(_ProbeName) - 1] = '\0';
}

void AppBLEProtocolParser::bindBatteryInfo(IAppBLEProtocolBatteryInfo *battery_info)
{
    _BatteryInfo = battery_info;
}


void AppBLEProtocolParser::bindBLEController(SysBLEControl *ble_controller)
{
    _BLEController = ble_controller;
}


void AppBLEProtocolParser::beginConstruction()
{
    _Delim = "{";
    _Seek = _SendInfoBuffer;
    addKeyValue("probe", _ProbeName);
    addKeyValue("battery", _BatteryInfo->getBatteryLevel());
    addKeyValue("charging", _BatteryInfo->isCharging() ? "true" : "false");
}


void AppBLEProtocolParser::addKeyObject(const char *key, const char *value)
{
    _Seek += sprintf(_Seek, "%s\"%s\":%s", _Delim, key, value);
    _Delim = ",";
}


void AppBLEProtocolParser::addKeyValue(const char *key, const char *value)
{
    _Seek += sprintf(_Seek, "%s\"%s\":\"%s\"", _Delim, key, value);
    _Delim = ",";
}


void AppBLEProtocolParser::addKeyValue(const char *key, int value)
{
    _Seek += sprintf(_Seek, "%s\"%s\":%d", _Delim, key, value);
    _Delim = ",";
}


void AppBLEProtocolParser::endConstruction()
{
    _Seek += sprintf(_Seek, "}");
    _BLEController->notify(_SendInfoBuffer);
}
