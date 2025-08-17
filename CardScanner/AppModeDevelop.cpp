#define VERBOSE (1)
#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppModeDevelop.h"
#include "AppCardListenerMultiRfid2.h"
#include "SysLog.h"


void AppModeDevelop::start()
{
    _FrameCount = 0;
    SysDisplay::getInstance().clear();
 
    // カードリーダー初期化
    _CardReader = AppCardListenerUnitRfid2Base::createCardListener();
    _CardReader->init();

    // ゲージ
    _Gauge = SysSpriteManager::getInstance().createGauge(128, 8, 0, 200);
}

void AppModeDevelop::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_Gauge);
}

void AppModeDevelop::update()
{
    _FrameCount++;

    _CardReader->scan();

    // ゲージ(デバイス生きてるのか確認する用)
    _Gauge->setCurrentValue(_FrameCount % 200);
    _Gauge->update();
}


void AppModeDevelop::draw()
{
    _Gauge->draw(8, 8);
}
