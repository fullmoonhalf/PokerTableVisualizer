#include "SysSpriteManager.h"
#include "AppBatteryGauge.h"


#define BATTERY_GAUGE_WIDTH (64)
#define BATTERY_GAUGE_HEIGHT (8)
#define BATTERY_LABEL_WIDTH (80)



AppBatteryGauge::AppBatteryGauge()
{
    _Label = SysSpriteManager::getInstance().createSprite(BATTERY_LABEL_WIDTH, BATTERY_GAUGE_HEIGHT);
    _Gauge = SysSpriteManager::getInstance().createGauge(BATTERY_GAUGE_WIDTH, BATTERY_GAUGE_HEIGHT, 0, 100);
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


void AppBatteryGauge::update()
{
    char buffer[32];
    auto level = M5.Power.getBatteryLevel();
    sprintf(buffer, "Battery %3d%%", level);
    _Label->clear();
    _Label->drawText(0, 0, buffer);
    _Gauge->setCurrentValue(level);
    _Gauge->update();
}


void AppBatteryGauge::draw(int x, int y)
{
    _Label->draw(x, y);
    _Gauge->draw(x+BATTERY_LABEL_WIDTH, y);
}
