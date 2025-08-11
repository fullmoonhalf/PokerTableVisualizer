#include "SysLog.h"
#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppSetting.h"
#include "AppModeReader.h"



#define BATTERY_GAUGE_WIDTH (64)
#define BATTERY_GAUGE_HEIGHT (8)
#define BATTERY_GAUGE_ANCHOR (8)


void AppModeReader::start()
{
    SysDisplay::getInstance().clear();

    // カードリーダー初期化
    {
        _CardReader = new AppCardListenerUnitRfid2();
        _CardReader->init();
    }

    // BLE コントローラ初期化
    {
        AppSetting::getInstance().get(SETTING_KEY_PROBE_NAME, _ProbeName);
        AppSetting::getInstance().get(SETTING_KEY_BLE_IDENTIFIER, _BLE_identifier);
        AppSetting::getInstance().get(SETTING_KEY_BLE_SERVICE_UUID, _BLE_service_uuid);
        AppSetting::getInstance().get(SETTING_KEY_BLE_CHARACTERISTICS_UUID, _BLE_characteristics_uuid);
        _BLEController = new SysBLEControl(_BLE_identifier, _BLE_service_uuid, _BLE_characteristics_uuid);
    }

    // バッテリーゲージ
    {
        _GaugeBattery = SysSpriteManager::getInstance().createGauge(BATTERY_GAUGE_WIDTH, BATTERY_GAUGE_HEIGHT, 0, 100);
        _GaugeBatteryPosX = SysDisplay::getInstance().getWidth() - BATTERY_GAUGE_WIDTH - BATTERY_GAUGE_ANCHOR;
        _GaugeBatteryPosY = BATTERY_GAUGE_ANCHOR;
    }
}

void AppModeReader::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_GaugeBattery);
    delete _CardReader;
}

void AppModeReader::update()
{
    _GaugeBattery->setCurrentValue(M5.Power.getBatteryLevel());
    _GaugeBattery->update();

    if(_CardReader->scan())
    {
        _CardReader->dump();
        char *seek = _SendInfoBuffer;
        seek += sprintf(seek, "{Seat:\"%s\",", _ProbeName);
        seek += _CardReader->encode(seek);
        seek += sprintf(seek, "}");
        _BLEController->notify(_SendInfoBuffer);
    }
}

void AppModeReader::draw()
{
    _GaugeBattery->draw(_GaugeBatteryPosX, _GaugeBatteryPosY);
}
