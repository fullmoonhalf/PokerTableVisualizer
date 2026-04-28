#include "SysSpriteManager.h"
#include "AppBatteryGauge.h"


#define BATTERY_GAUGE_WIDTH (64)
#define BATTERY_GAUGE_HEIGHT (8)
#define BATTERY_LABEL_WIDTH (80)



AppBatteryGauge::AppBatteryGauge()
{
    _Label = SysSpriteManager::getInstance().createSprite(BATTERY_LABEL_WIDTH, BATTERY_GAUGE_HEIGHT);
    _Gauge = SysSpriteManager::getInstance().createGauge(BATTERY_GAUGE_WIDTH, BATTERY_GAUGE_HEIGHT, 0, 100);
    _CurrentBatteryLevel = 0;
}


AppBatteryGauge::~AppBatteryGauge()
{
    SysSpriteManager::getInstance().destroyDrawable(_Gauge);
    SysSpriteManager::getInstance().destroySprite(_Label);
}


int AppBatteryGauge::getWidth()
{
    return BATTERY_GAUGE_WIDTH + BATTERY_LABEL_WIDTH;
}


int AppBatteryGauge::getHeight()
{
    return BATTERY_GAUGE_HEIGHT;
}


int AppBatteryGauge::getBatteryLevel()
{
    return _CurrentBatteryLevel;
}


bool AppBatteryGauge::isCharging()
{
    return M5.Power.isCharging();
}


void AppBatteryGauge::update()
{
    char buffer[32];
    _CurrentBatteryLevel = M5.Power.getBatteryLevel();
    sprintf(buffer, "Battery %3d%%", _CurrentBatteryLevel);

    uint16_t color = isCharging() ? TFT_YELLOW : TFT_WHITE;

    _Label->clear();
    _Label->drawText(0, 0, 1.0f, color, buffer);
    _Gauge->setColor(color);
    _Gauge->setCurrentValue(_CurrentBatteryLevel);
    _Gauge->update();
}


void AppBatteryGauge::draw(int x, int y)
{
    _Label->draw(x, y);
    _Gauge->draw(x+BATTERY_LABEL_WIDTH, y);
}
