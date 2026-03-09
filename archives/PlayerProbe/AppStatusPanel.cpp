#include "AppStatusPanel.h"
#include "AppSetting.h"



AppStatusPanel::AppStatusPanel(AppDisplay *display)
    : _Display(display)
    , _RfidDriver(nullptr)
    , _Reporter(nullptr)
    , _Setting(nullptr)
{
    _GaugeBattery = new GuiGauge(&_Display->Display, 100, 100, 50, 5);
    _SpriteRfid = display->createSprite(128, 16);
    _SpriteReporter = display->createSprite(128, 16);
    _SpriteSetting = display->createSprite(64, 16);
    _SpriteMode = display->createSprite(64, 16);
}


void AppStatusPanel::bind(UhfRfidDriver *rfid_driver)
{
    _RfidDriver = rfid_driver;
}


void AppStatusPanel::bind(AppReporter *reporter)
{
    _Reporter = reporter;
}


void AppStatusPanel::bind(SysSetting *setting)
{
    _Setting = setting;
}


/// @brief 初期化
void AppStatusPanel::setup()
{
}


/// @brief 更新
void AppStatusPanel::update()
{
    // バッテリー状況
    int battery_percentage = M5.Power.getBatteryLevel();
    _GaugeBattery->setCurrentValue(battery_percentage);
    _GaugeBattery->update();

    // RFID 読取機まわりの状況
    if(_RfidDriver != nullptr)
    {
        char status[32];
        sprintf(status, "RFID: %d", _RfidDriver->getUpdateCount());
        _SpriteRfid->drawString(status, 0, 0);
    }
    else
    {
        _SpriteRfid->drawString("RFID: disable", 0, 0);
    }

    // レポーターまわりの状況
    if(_Reporter != nullptr)
    {
        char status[32];
        sprintf(status, "Rep.: %d", _Reporter->getFrameCount());
        _SpriteReporter->drawString(status, 0, 0);   
    }
    else
    {
        _SpriteReporter->drawString("Reporter: disable", 0, 0);   
    }

    // 設定まわりの状況
    if(_Setting != nullptr)
    {
        _SpriteSetting->drawString(_Setting->get(SETTING_KEY_BLE_IDENTIFIER).c_str(), 0, 0);
        _SpriteMode->drawString(_Setting->get(SETTING_KEY_MODE).c_str(), 0, 0);
    }
}


/// @brief 描画
/// @param x 
/// @param y 
void AppStatusPanel::draw(int x, int y)
{
    _GaugeBattery->draw(x, y);
    _SpriteRfid->pushSprite(x, y+7);
    _SpriteReporter->pushSprite(x, y+14);
    _SpriteSetting->pushSprite(x+96, y);
    _SpriteMode->pushSprite(x+160, y);
}



void AppStatusPanel::dumpMemoryStatus()
{
    int32_t free_size_8bit = heap_caps_get_free_size(MALLOC_CAP_8BIT);
    int32_t free_size_32bit = heap_caps_get_free_size(MALLOC_CAP_32BIT);
    int32_t free_size_dma = heap_caps_get_free_size(MALLOC_CAP_DMA);
    int32_t total_size_8bit = heap_caps_get_total_size(MALLOC_CAP_8BIT);
    int32_t total_size_32bit = heap_caps_get_total_size(MALLOC_CAP_32BIT);
    int32_t total_size_dma = heap_caps_get_total_size(MALLOC_CAP_DMA);

    Serial.println("<total capability size>");
    Serial.printf("MALLOC_CAP_8BIT   :%d/%d\r\n", free_size_8bit, total_size_8bit);
    Serial.printf("MALLOC_CAP_32BIT  :%d/%d\r\n", free_size_32bit, total_size_32bit);
    Serial.printf("MALLOC_CAP_DMA    :%d/%d\r\n", free_size_dma, total_size_dma);
}
