// M5stack 関連
#include <M5Unified.h>
#include "SD.h"
// アプリまわり
#include "SysSpriteManager.h"
#include "AppSetting.h"
#include "CardScanner.h"


SysGuiGauge *Gauge = nullptr;


/// @brief 初期化処理
void CardScanner::setup()
{
    // System
    M5.begin();
    M5.Power.begin();
    Serial.begin(115200);

    // Settings
    _Setting.set(SETTING_KEY_MODE, "Develop");
    _Setting.set(SETTING_KEY_PROBE_NAME, "Seat01");
    _Setting.set(SETTING_KEY_PROBE_CARD_CAPACITY, "2");  
    _Setting.set(SETTING_KEY_BLE_IDENTIFIER, "PTV_PP_001");
    _Setting.set(SETTING_KEY_BLE_SERVICE_UUID, "cbaabb28-4e81-49c4-b775-aedfd27d8db0");
    _Setting.set(SETTING_KEY_BLE_CHARACTERISTICS_UUID, "45f116ee-b087-4271-888d-a15eebebd2eb");
    if(SD.begin(GPIO_NUM_4, SPI, 15000000))
    {
        Serial.println("SD initialize success.");
        _Setting.load();
    }
    else
    {
        Serial.println("SD initialize failure.");
    }

    // LCD
    _Display.init();

    // システムの初期化
    SysSpriteManager::getInstance().bind(&_Display);
    Gauge = SysSpriteManager::getInstance().createGauge(128, 8, 0, 100);
}


/// @brief 更新処理
void CardScanner::update()
{
    _FrameCount++;
    Serial.printf("%d\r\n", _FrameCount);

    Gauge->setCurrentValue(_FrameCount % 100);
    Gauge->update();
    Gauge->draw(10, 10);
}
