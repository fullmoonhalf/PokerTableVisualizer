#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppModeDevelop.h"


void AppModeDevelop::start()
{
    _FrameCount = 0;
    SysDisplay::getInstance().clear();
 
    _RfidDriver = new UnitRfid2Driver(MFRC522_CHIP_ADDRESS);
    _RfidDriver->init();

    _Gauge = SysSpriteManager::getInstance().createGauge(128, 8, 0, 200);
}

void AppModeDevelop::end()
{
    delete _RfidDriver;
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
