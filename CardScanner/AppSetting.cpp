#include <M5Unified.h>
#include "SD.h"
#include "AppSetting.h"
#include "SysUtils.h"
#include "SysLog.h"


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
    _Setting.set(SETTING_KEY_BLE_CHARACTERISTICS_UUID, "45f116ee-b087-4271-888d-a15eebebd2eb");
    if(SD.begin(GPIO_NUM_4, SPI, 15000000))
    {
        SysLog::printf(__NAMEOF__(AppSetting), "SD initialize success.");
        _Setting.load();
    }
    else
    {
        SysLog::printf(__NAMEOF__(AppSetting), "SD initialize failure.");
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
