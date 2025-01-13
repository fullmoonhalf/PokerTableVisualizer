#include "AppStatusPanel.h"



AppStatusPanel::AppStatusPanel(AppDisplay *display, UhfRfidDriver *rfid_driver)
    : _Display(display)
    , _RfidDriver(rfid_driver)
{
    _GaugeBattery = new GuiGauge(&_Display->Display, 100, 100, 25, 5);

    _SpriteRfid = new LGFX_Sprite( &_Display->Display );
    _SpriteRfid->createSprite(100, 10);
    _SpriteRfid->setColorDepth( _Display->Display.getColorDepth() );
}


/// @brief 初期化
void AppStatusPanel::init()
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
    {
        char status[32];
        sprintf(status, "%d", _RfidDriver->getUpdateCount());
        _SpriteRfid->drawString(status, 0, 0);
    }
}


/// @brief 描画
/// @param x 
/// @param y 
void AppStatusPanel::draw(int x, int y)
{
    _GaugeBattery->draw(x, y);
    _SpriteRfid->pushSprite(x, y+7);
}
