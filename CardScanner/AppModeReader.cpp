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

#define BLE_LABEL_ANCHOR (8)
#define BLE_LABEL_WIDTH (192)
#define BLE_LABEL_HEIGHT (64)

#define SENSOR_LABEL_ANCHOR (8)
#define SENSOR_LABEL_WIDTH (192)
#define SENSOR_LABEL_HEIGHT (8)


void AppModeReader::start()
{
    SysDisplay::getInstance().clear();

    // カードリーダー初期化
    {
        _CardReader = AppCardListenerUnitRfid2Base::createCardListener();
        _CardReader->init();
        _SensorCount = _CardReader->getSensorCount();
    }

    // BLE コントローラ初期化
    {
        AppSetting::getInstance().get(SETTING_KEY_PROBE_NAME, _ProbeName);
        AppSetting::getInstance().get(SETTING_KEY_BLE_IDENTIFIER, _BLE_identifier);
        AppSetting::getInstance().get(SETTING_KEY_BLE_SERVICE_UUID, _BLE_service_uuid);
        AppSetting::getInstance().get(SETTING_KEY_BLE_CHARACTERISTICS_UUID, _BLE_characteristics_uuid);
        _BLEController = new SysBLEControl(_BLE_identifier, _BLE_service_uuid, _BLE_characteristics_uuid);
    }

    // 表示まわりの初期化
    start_indicator();
}


void AppModeReader::start_indicator()
{
    // バッテリーゲージ
    {
        _LabelBattery = SysSpriteManager::getInstance().createSprite(BATTERY_LABEL_WIDTH, BATTERY_GAUGE_HEIGHT);
        _GaugeBattery = SysSpriteManager::getInstance().createGauge(BATTERY_GAUGE_WIDTH, BATTERY_GAUGE_HEIGHT, 0, 100);
        _GaugeBatteryPosX = SysDisplay::getInstance().getWidth() - BATTERY_GAUGE_WIDTH - BATTERY_GAUGE_ANCHOR;
        _GaugeBatteryPosY = BATTERY_GAUGE_ANCHOR;
        _LabelBatteryPosX = _GaugeBatteryPosX - BATTERY_LABEL_WIDTH;
    }
    // シート情報
    {
        _LabelSeat = SysSpriteManager::getInstance().createSprite(SEAT_LABEL_WIDTH, SEAT_LABEL_HEIGHT);
        _LabelSeatPosX = SEAT_LABEL_ANCHOR;
        _LabelSeatPosY = _GaugeBatteryPosY + BATTERY_GAUGE_HEIGHT + SEAT_LABEL_ANCHOR;
        _LabelSeat->drawText(0, 0, _ProbeName);
    }
    // BLE デバイス情報
    {
        _LabelBLEStatus = SysSpriteManager::getInstance().createSprite(BLE_LABEL_WIDTH, BLE_LABEL_HEIGHT);
        _LabelBLEPosX = BLE_LABEL_ANCHOR;
        _LabelBLEPosY = _LabelSeatPosY + SEAT_LABEL_HEIGHT + BLE_LABEL_ANCHOR;
    }
    // センサーの情報
    {
        char buffer[32];
        sprintf(buffer, "Sensor(s) %d", _SensorCount);
        _LabelSensorHeader = SysSpriteManager::getInstance().createSprite(SENSOR_LABEL_WIDTH, SENSOR_LABEL_HEIGHT);
        _LabelSensorHeader->drawText(0, 0, buffer);
        for(int index=0; index<_SensorCount; ++index)
        {
            _LabelSensorStatus[index] = SysSpriteManager::getInstance().createSprite(SENSOR_LABEL_WIDTH, SENSOR_LABEL_HEIGHT);
        }
        _LabelSensorPosX = BLE_LABEL_ANCHOR;
        _LabelSensorPosY = _LabelBLEPosY + BLE_LABEL_HEIGHT + BLE_LABEL_ANCHOR;
    }
}


void AppModeReader::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_GaugeBattery);
    delete _CardReader;
}

void AppModeReader::update()
{
    // スキャン処理
    if(_CardReader->scan() == false)
    {
        wait(500);
    }
    // ＢＬＥデバイスへの通知
    {
        char *seek = _SendInfoBuffer;
        seek += sprintf(seek, "{\"probe\":\"%s\",", _ProbeName);
        seek += _CardReader->encode(seek);
        seek += sprintf(seek, "}");
        _BLEController->notify(_SendInfoBuffer);
    }
    // インジケーターの更新
    update_indicator();
}


void AppModeReader::update_indicator()
{
    char buffer[32];

    // バッテリー情報更新
    {
        auto level = M5.Power.getBatteryLevel();
        sprintf(buffer, "Battery %3d%%", level);
        _LabelBattery->clear();
        _LabelBattery->drawText(0, 0, buffer);
        _GaugeBattery->setCurrentValue(level);
        _GaugeBattery->update();
    }

    // BLE 情報更新
    {
        _LabelBLEStatus->clear();
        sprintf(buffer, "BLE connection %d", _BLEController->getConnectionCount());
        _LabelBLEStatus->drawText(0, 0, buffer);
    }

    // センサー情報更新
    for(int index=0; index<_SensorCount; ++index)
    {
        auto sprite = _LabelSensorStatus[index];
        char *seek = buffer;
        seek += sprintf(seek, "[%d] ", index);
        auto status = _CardReader->getSensorStatus(index, seek);
        uint16_t color = status ? TFT_GREEN : TFT_DARKGREEN;
        sprite->clear();
        sprite->drawText(0, 0, 1.0f, color, buffer);
    }
}


void AppModeReader::draw()
{
    _GaugeBattery->draw(_GaugeBatteryPosX, _GaugeBatteryPosY);
    _LabelBattery->draw(_LabelBatteryPosX, _GaugeBatteryPosY);
    _LabelSeat->draw(_LabelSeatPosX, _LabelSeatPosY);
    _LabelBLEStatus->draw(_LabelBLEPosX, _LabelBLEPosY);
    _LabelSensorHeader->draw(_LabelSensorPosX, _LabelSensorPosY);
    int y = _LabelSensorPosY;
    for(int index=0; index<_SensorCount; ++index)
    {
        y += SENSOR_LABEL_HEIGHT;
        _LabelSensorStatus[index]->draw(_LabelSensorPosX, y);
    }
}
