#ifndef __APP_SETTING_H__
#define __APP_SETTING_H__
#include "SysSingleton.h"
#include "SysSetting.h"

#define SETTING_KEY_MODE "MODE"
#define SETTING_KEY_PROBE_NAME "PROBE_NAME"
#define SETTING_KEY_PROBE_CARD_CAPACITY "PROBE_CARD_CAPACITY"
#define SETTING_KEY_BLE_IDENTIFIER "BLE_IDENTIFIER"
#define SETTING_KEY_BLE_SERVICE_UUID "BLE_SERVICE_UUID"
#define SETTING_KEY_BLE_CHARACTERISTICS_TX_UUID "BLE_CHARACTERISTICS_TX_UUID"
#define SETTING_KEY_BLE_CHARACTERISTICS_RX_UUID "BLE_CHARACTERISTICS_RX_UUID"


class AppSetting : public SysSingletonBase<AppSetting>
{
    friend class SysSingletonBase<AppSetting>;

public:
    void init();
    bool get(const char *key, char *outValue);
    int getAsInt(const char *key);

private:
    AppSetting();
    SysSetting _Setting;
};


#endif /* __APP_SETTING_H__ */