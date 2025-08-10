#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppModeDevelop.h"


void AppModeDevelop::start()
{
    SysDisplay::getInstance().clear();
    _FrameCount = 0;
    _Gauge = SysSpriteManager::getInstance().createGauge(128, 8, 0, 200);
}

void AppModeDevelop::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_Gauge);
}

void AppModeDevelop::update()
{
    _FrameCount++;
    _Gauge->setCurrentValue(_FrameCount % 200);
    _Gauge->update();
}

void AppModeDevelop::draw()
{
    _Gauge->draw(8, 8);
}
