#include "SysLog.h"
#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "SysTouchManager.h"
#include "AppSetting.h"
#include "AppModeReader.h"


#define SEAT_LABEL_WIDTH (128)
#define SEAT_LABEL_HEIGHT (8)
#define SEAT_LABEL_ANCHOR (8)

#define BLE_LABEL_ANCHOR (8)
#define BLE_LABEL_WIDTH (192)
#define BLE_LABEL_HEIGHT (32)

#define MONITOR_LABEL_ANCHOR (8)
#define MONITOR_LABEL_WIDTH (192)
#define MONITOR_LABEL_HEIGHT (16)

#define SENSOR_LABEL_ANCHOR (8)
#define SENSOR_LABEL_WIDTH (192)
#define SENSOR_LABEL_HEIGHT (8)


/// @brief 開始処理
void AppModeReader::start()
{
    SysDisplay::getInstance().clear();

    // 論理更新
    _LastMillis = millis();
    _ScreenSaveCounter = 0;
    _Scannable = false;
    _HeartbeatCounter = 0;
    _Timeout = 500;
    _Idoltime = 5000;
    _HeartbartInterval = 5000;

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
        AppSetting::getInstance().get(SETTING_KEY_BLE_CHARACTERISTICS_TX_UUID, _BLE_characteristics_tx_uuid);
        AppSetting::getInstance().get(SETTING_KEY_BLE_CHARACTERISTICS_RX_UUID, _BLE_characteristics_rx_uuid);
        _BLEController = new SysBLEControl(_BLE_identifier, _BLE_service_uuid, _BLE_characteristics_tx_uuid, _BLE_characteristics_rx_uuid);
        _BLEController->bind(this);
    }

    // 表示まわりの初期化
    start_indicator();
}


/// @brief インジケーターの開始処理
void AppModeReader::start_indicator()
{
    // バッテリーゲージ
    {
        _BatteryGauge = new AppBatteryGauge();
        _GaugeBatteryPosX = SysDisplay::getInstance().getWidth() - _BatteryGauge->getWidth() - 8;
        _GaugeBatteryPosY = 8;
    }
    // シート情報
    {
        _LabelSeat = SysSpriteManager::getInstance().createSprite(SEAT_LABEL_WIDTH, SEAT_LABEL_HEIGHT);
        _LabelSeatPosX = SEAT_LABEL_ANCHOR;
        _LabelSeatPosY = _GaugeBatteryPosY + _BatteryGauge->getHeight() + SEAT_LABEL_ANCHOR;
        _LabelSeat->drawText(0, 0, _ProbeName);
    }
    // BLE デバイス情報
    {
        _LabelBLEStatus = SysSpriteManager::getInstance().createSprite(BLE_LABEL_WIDTH, BLE_LABEL_HEIGHT);
        _LabelBLEPosX = BLE_LABEL_ANCHOR;
        _LabelBLEPosY = _LabelSeatPosY + SEAT_LABEL_HEIGHT + BLE_LABEL_ANCHOR;
    }
    // モニター側から受けてる情報
    {
        _LabelMonitorStatus = SysSpriteManager::getInstance().createSprite(MONITOR_LABEL_WIDTH, MONITOR_LABEL_HEIGHT);
        _LabelMonitorPosX = MONITOR_LABEL_ANCHOR;
        _LabelMonitorPosY = _LabelBLEPosY + BLE_LABEL_HEIGHT + MONITOR_LABEL_ANCHOR;;
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
        _LabelSensorPosY = _LabelMonitorPosY + MONITOR_LABEL_HEIGHT + BLE_LABEL_ANCHOR;
    }
}


/// @brief モード終了処理
void AppModeReader::end()
{
    for(int index=0; index<_SensorCount; ++index)
    {
        SysSpriteManager::getInstance().destroySprite(_LabelSensorStatus[index]);
    }
    SysSpriteManager::getInstance().destroySprite(_LabelSensorHeader);
    SysSpriteManager::getInstance().destroySprite(_LabelBLEStatus);
    SysSpriteManager::getInstance().destroySprite(_LabelMonitorStatus);    
    SysSpriteManager::getInstance().destroySprite(_LabelSeat);
    delete _BatteryGauge;
    delete _BLEController;
    delete _CardReader;
}


/// @brief 更新処理
void AppModeReader::update()
{
    // スクリーン輝度
    uint32_t current_millis = millis();
    auto gap = current_millis - _LastMillis;
    _LastMillis = current_millis;
    if(gap > 0)
    {
        _ScreenSaveCounter += gap;
        _HeartbeatCounter += gap;
    }
    if(SysTouchManager::getInstance().isTouched())
    {
        _ScreenSaveCounter = 0;
    }

    bool display_enable = _ScreenSaveCounter < _Idoltime;
    SysDisplay::getInstance().setEnable(display_enable);

    // スキャン処理
    bool NeedToWait = true;
    if(_Scannable)
    {
        if(_CardReader->scan(_Timeout))
        {
            send(true);
        }
        NeedToWait = false;
    }
    if(_HeartbeatCounter > _HeartbartInterval)
    {
        send(false);
    }

    // 待ち処理
    if(NeedToWait)
    {
        int wait_candidate = (_HeartbartInterval - _HeartbeatCounter)/2;
        int wait_time = wait_candidate > 500 ? wait_candidate : 500;
        wait(wait_time);
    }

    // インジケーターの更新
    update_indicator();
}


/// @brief データ送信
/// @param send_scan_data 
void AppModeReader::send(bool send_scan_data)
{
    char *seek = _SendInfoBuffer;
    seek += sprintf(seek, "{\"probe\":\"%s\",\"battery\":\"%d\"", _ProbeName, _BatteryGauge->getBatteryLevel());
    if(send_scan_data)
    {
        seek += sprintf(seek, ",\"mode\":\"scan\",");
        seek += _CardReader->encode(seek);
    }
    else
    {
        seek += sprintf(seek, ",\"mode\":\"heartbeat\"");
    }

    seek += sprintf(seek, "}");
    _BLEController->notify(_SendInfoBuffer);
    _HeartbeatCounter = 0;
}



/// @brief インジケーターの更新
void AppModeReader::update_indicator()
{
    char buffer[32];

    // バッテリー情報更新
    {
        _BatteryGauge->update();
    }
    // モニター情報更新
    {
        _LabelMonitorStatus->clear();
        sprintf(buffer, "Monitor scan:%d timeout:%d", _Scannable, _Timeout);
        _LabelMonitorStatus->drawText(0, 0, 1.f, TFT_RED, buffer);
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


/// @brief 描画処理
void AppModeReader::draw()
{
    _BatteryGauge->draw(_GaugeBatteryPosX, _GaugeBatteryPosY);
    _LabelSeat->draw(_LabelSeatPosX, _LabelSeatPosY);
    _LabelMonitorStatus->draw(_LabelMonitorPosX, _LabelMonitorPosY);
    _LabelBLEStatus->draw(_LabelBLEPosX, _LabelBLEPosY);
    _LabelSensorHeader->draw(_LabelSensorPosX, _LabelSensorPosY);
    int y = _LabelSensorPosY;
    for(int index=0; index<_SensorCount; ++index)
    {
        y += SENSOR_LABEL_HEIGHT;
        _LabelSensorStatus[index]->draw(_LabelSensorPosX, y);
    }
}


/// @brief 
/// @param buffer 
/// @param size 
void AppModeReader::onBLEWrite(const char *buffer, int size)
{
    SysSettingStringStream stream(buffer);
    SysSetting setting;

    if(setting.loadFromStream(&stream))
    {
        setting.dump();
        auto mode = setting.get("mode");
        _Scannable = setting.getAsInt("scan") != 0 ? true : false; 
        _Timeout = setting.getAsInt("timeout");
        _Idoltime = setting.getAsInt("idol");
        _HeartbartInterval = setting.getAsInt("heartbeat");
    }
}
