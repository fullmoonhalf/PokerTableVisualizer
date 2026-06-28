#include <M5Unified.h>
#include "SD.h"
#include "AppSetting.h"
#include "SysUtils.h"
#include "SysLog.h"
#include "SysHardwareSpecification.h"



AppSetting::AppSetting()
{
}


void AppSetting::init()
{
    _Setting.set(SETTING_KEY_MODE, "Develop");
    _Setting.set(SETTING_KEY_PROBE_NAME, "Seat01");
    _Setting.set(SETTING_KEY_PROBE_CARD_CAPACITY, "2");  
    _Setting.set(SETTING_KEY_BLE_IDENTIFIER, "PTV_PP_001");
    _Setting.set(SETTING_KEY_BLE_SERVICE_UUID, "cbaabb28-4e81-49c4-b775-aedfd27d8db0");
    _Setting.set(SETTING_KEY_BLE_CHARACTERISTICS_TX_UUID, "45f116ee-b087-4271-888d-a15eebebd2eb");
    _Setting.set(SETTING_KEY_BLE_CHARACTERISTICS_RX_UUID, "45f116ee-b087-4271-888d-a15eebebd2ee");

    auto sd_pin_id = SysHardwareSpecification::getInstance().getGpioPinIdForSdCardCs();
    if(SD.begin(sd_pin_id, SPI, 15000000))
    {
        SysLog::printf(__NAMEOF__(AppSetting), "SD initialize success. (CS pin: %d)", sd_pin_id);
        _Setting.load();
        _Setting.dump();
    }
    else
    {
        SysLog::printf(__NAMEOF__(AppSetting), "SD initialize failure. (CS pin: %d)", sd_pin_id);
    }
}


bool AppSetting::get(const char *key, char *outValue)
{
    auto setting_value = _Setting.get(key);
    const char *value = setting_value.c_str();
    strcpy(outValue, value);
    return true;
}


int AppSetting::getAsInt(const char *key)
{
    return _Setting.getAsInt(key);
}
