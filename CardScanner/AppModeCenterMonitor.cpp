#include "SysDisplay.h"
#include "AppSetting.h"
#include "AppModeCenterMonitor.h"


#define LAYOUT_BATTERY_GAUGE_ANCHOR_X (8)
#define LAYOUT_BATTERY_GAUGE_ANCHOR_Y (8)



void AppModeCenterMonitor::start()
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
        AppSetting::getInstance().get(SETTING_KEY_BLE_CHARACTERISTICS_TX_UUID, _BLE_characteristics_tx_uuid);
        AppSetting::getInstance().get(SETTING_KEY_BLE_CHARACTERISTICS_RX_UUID, _BLE_characteristics_rx_uuid);
        _BLEController = new SysBLEControl(_BLE_identifier, _BLE_service_uuid, _BLE_characteristics_tx_uuid, _BLE_characteristics_rx_uuid);
        _BLEController->bind(this);
    }

    // 表示構成要素の初期化
    {
        _BatteryGauge = new AppBatteryGauge();
        _GaugeBatteryPosX = SysDisplay::getInstance().getWidth() - _BatteryGauge->getWidth() - LAYOUT_BATTERY_GAUGE_ANCHOR_X;
        _GaugeBatteryPosY = LAYOUT_BATTERY_GAUGE_ANCHOR_Y;
    }

    // BLE プロトコルパーサー初期化
    {
        _BLEProtocolParser = new AppBLEProtocolParser();
        _BLEProtocolParser->setProbeName(_ProbeName);
        _BLEProtocolParser->bindBatteryInfo(_BatteryGauge);
        _BLEProtocolParser->bindBLEController(_BLEController);

        // 自身がモニターである事をブラウザ側に通知
        _BLEProtocolParser->beginConstruction();
        _BLEProtocolParser->addKeyValue("mode", "change_monitor");
        _BLEProtocolParser->endConstruction();
    }
}


void AppModeCenterMonitor::end()
{
    delete _BLEProtocolParser;
    delete _BatteryGauge;
    delete _BLEController;
    delete _CardReader;
}


void AppModeCenterMonitor::update()
{
    _BatteryGauge->update();
}


void AppModeCenterMonitor::draw()
{
    _BatteryGauge->draw(_GaugeBatteryPosX, _GaugeBatteryPosY);
}



/// @brief データ受信
/// @param buffer 
/// @param size 
void AppModeCenterMonitor::onBLEWrite(const char *buffer, int size)
{
    SysSettingStringStream stream(buffer);
    SysSetting setting;

    if(setting.loadFromStream(&stream))
    {
        setting.dump();
    }
}
