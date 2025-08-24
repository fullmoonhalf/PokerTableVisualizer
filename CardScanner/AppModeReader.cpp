#include "SysLog.h"
#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppSetting.h"
#include "AppModeReader.h"



#define BATTERY_GAUGE_WIDTH (64)
#define BATTERY_GAUGE_HEIGHT (8)
#define BATTERY_LABEL_WIDTH (80)
#define BATTERY_GAUGE_ANCHOR (8)

#define SEAT_LABEL_WIDTH (128)
#define SEAT_LABEL_HEIGHT (8)
#define SEAT_LABEL_ANCHOR (8)


void AppModeReader::start()
{
    SysDisplay::getInstance().clear();

    // カードリーダー初期化
    {
        _CardReader = AppCardListenerUnitRfid2Base::createCardListener();
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
        _LabelBattery = SysSpriteManager::getInstance().createSprite(BATTERY_LABEL_WIDTH, BATTERY_GAUGE_HEIGHT);
        _GaugeBattery = SysSpriteManager::getInstance().createGauge(BATTERY_GAUGE_WIDTH, BATTERY_GAUGE_HEIGHT, 0, 100);
        _GaugeBatteryPosX = SysDisplay::getInstance().getWidth() - BATTERY_GAUGE_WIDTH - BATTERY_GAUGE_ANCHOR;
        _GaugeBatteryPosY = BATTERY_GAUGE_ANCHOR;
        _LabelBatteryPosX = _GaugeBatteryPosX - BATTERY_LABEL_WIDTH;
    }
    {
        _LabelSeat = SysSpriteManager::getInstance().createSprite(SEAT_LABEL_WIDTH, SEAT_LABEL_HEIGHT);
        _LabelSeatPosX = SEAT_LABEL_ANCHOR;
        _LabelSeatPosY = _GaugeBatteryPosY + BATTERY_GAUGE_HEIGHT + SEAT_LABEL_ANCHOR;
        _LabelSeat->drawText(0, 0, _ProbeName);
    }
}

void AppModeReader::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_GaugeBattery);
    delete _CardReader;
}

void AppModeReader::update()
{
    // バッテリー情報更新
    {
        auto level = M5.Power.getBatteryLevel();
        char buffer[32];
        sprintf(buffer, "Battery %3d%%", level);
        _LabelBattery->clear();
        _LabelBattery->drawText(0, 0, buffer);
        _GaugeBattery->setCurrentValue(level);
        _GaugeBattery->update();
    }

    if(_CardReader->scan() == false)
    {
        wait(500);
    }

    {
        char *seek = _SendInfoBuffer;
        seek += sprintf(seek, "{\"probe\":\"%s\",", _ProbeName);
        seek += _CardReader->encode(seek);
        seek += sprintf(seek, "}");
        _BLEController->notify(_SendInfoBuffer);
    }
}

void AppModeReader::draw()
{
    _GaugeBattery->draw(_GaugeBatteryPosX, _GaugeBatteryPosY);
    _LabelBattery->draw(_LabelBatteryPosX, _GaugeBatteryPosY);
    _LabelSeat->draw(_LabelSeatPosX, _LabelSeatPosY);
}
