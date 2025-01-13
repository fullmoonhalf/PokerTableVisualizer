#include "AppStatusPanel.h"



AppStatusPanel::AppStatusPanel(AppDisplay *display)
{
    _Display = display;
    _GaugeBattery = new GuiGauge(&_Display->Display, 100, 100, 50, 10);
}


/// @brief 初期化
void AppStatusPanel::init()
{
}


/// @brief 更新
void AppStatusPanel::update()
{
    int battery_percentage = M5.Power.getBatteryLevel();
    _GaugeBattery->setCurrentValue(battery_percentage);
    _GaugeBattery->update();
}


/// @brief 描画
/// @param x 
/// @param y 
void AppStatusPanel::draw(int x, int y)
{
    _GaugeBattery->draw(x, y);
}
