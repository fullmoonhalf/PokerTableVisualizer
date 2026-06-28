#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppSetting.h"
#include "AppModeCenterMonitor.h"
#include <string.h>


#define LAYOUT_BATTERY_GAUGE_ANCHOR_X (8)
#define LAYOUT_BATTERY_GAUGE_ANCHOR_Y (8)
#define LABEL_ANCHOR_X (8)
#define LABEL_WIDTH (304)
#define LABEL_HEIGHT_TITLE (20)
#define LABEL_HEIGHT_LINE (14)


static const char *getSeatDisplayStatus(const char *status)
{
    if(strcmp(status, "OK") == 0)
    {
        return "OK";
    }
    if(strcmp(status, "NO") == 0)
    {
        return "NO";
    }
    if(strcmp(status, "DEAD") == 0)
    {
        return "--";
    }
    return "??";
}


static void formatCardLabel(int card_index, char *buffer, int buffer_size)
{
    if(card_index <= 0)
    {
        snprintf(buffer, buffer_size, "[--]");
        return;
    }

    static const char rank_letter[] = {'A','2','3','4','5','6','7','8','9','T','J','Q','K',};
    static const char suit_letter[] = {'s','h','d','c',};
    int rank_index = (card_index - 1) % 13;
    int suit_index = (card_index - 1) / 13;
    snprintf(buffer, buffer_size, "[%c%c]", rank_letter[rank_index], suit_letter[suit_index]);
}



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

        _LabelTitle = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_TITLE);
        _LabelLevel = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_LINE);
        _LabelBlind = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_LINE);
        _LabelSeatHeader = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_LINE);
        for(int index=0; index<3; ++index)
        {
            _LabelSeatStatus[index] = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_LINE);
        }
        _LabelBoardHeader = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_LINE);
        _LabelBoard = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_LINE);
        _LabelLastRx = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT_LINE);
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

    resetDealerDisplayState();
    redrawDealerDisplay();
}


void AppModeCenterMonitor::end()
{
    SysSpriteManager::getInstance().destroySprite(_LabelLastRx);
    SysSpriteManager::getInstance().destroySprite(_LabelBoard);
    SysSpriteManager::getInstance().destroySprite(_LabelBoardHeader);
    for(int index=0; index<3; ++index)
    {
        SysSpriteManager::getInstance().destroySprite(_LabelSeatStatus[index]);
    }
    SysSpriteManager::getInstance().destroySprite(_LabelSeatHeader);
    SysSpriteManager::getInstance().destroySprite(_LabelBlind);
    SysSpriteManager::getInstance().destroySprite(_LabelLevel);
    SysSpriteManager::getInstance().destroySprite(_LabelTitle);
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
    int y = _GaugeBatteryPosY + _BatteryGauge->getHeight() + 8;
    _LabelTitle->draw(LABEL_ANCHOR_X, y);
    y += 24;
    _LabelLevel->draw(LABEL_ANCHOR_X, y);
    y += 16;
    _LabelBlind->draw(LABEL_ANCHOR_X, y);
    y += 20;
    _LabelSeatHeader->draw(LABEL_ANCHOR_X, y);
    y += 16;
    for(int index=0; index<3; ++index)
    {
        _LabelSeatStatus[index]->draw(LABEL_ANCHOR_X, y);
        y += 14;
    }
    y += 6;
    _LabelBoardHeader->draw(LABEL_ANCHOR_X, y);
    y += 16;
    _LabelBoard->draw(LABEL_ANCHOR_X, y);
    y += 20;
    _LabelLastRx->draw(LABEL_ANCHOR_X, y);
    _BatteryGauge->draw(_GaugeBatteryPosX, _GaugeBatteryPosY);
}



/// @brief データ受信
/// @param buffer 
/// @param size 
void AppModeCenterMonitor::onBLEWrite(const char *buffer, int size)
{
    SysSettingStringStream stream(buffer);
    SysSetting setting;

    if(!setting.loadFromStream(&stream))
    {
        return;
    }

    if(setting.get("TYPE") != "DEALER_DISPLAY_STATE")
    {
        return;
    }

    _DisplayLevel = setting.getAsInt("LEVEL");
    _DisplaySB = setting.getAsInt("SB");
    _DisplayBB = setting.getAsInt("BB");
    for(int index=0; index<9; ++index)
    {
        updateSeatStatusFromSetting(&setting, index);
    }
    for(int index=0; index<5; ++index)
    {
        updateBoardCardFromSetting(&setting, index);
    }
    _LastRxMillis = millis();
    redrawDealerDisplay();
}


void AppModeCenterMonitor::resetDealerDisplayState()
{
    _DisplayLevel = 0;
    _DisplaySB = 0;
    _DisplayBB = 0;
    for(int index=0; index<9; ++index)
    {
        strcpy(_SeatStatus[index], "DEAD");
    }
    for(int index=0; index<5; ++index)
    {
        _BoardCards[index] = 0;
    }
    _LastRxMillis = 0;
}


void AppModeCenterMonitor::redrawDealerDisplay()
{
    char buffer[128];
    char board_buffer[96];
    char card_buffer[8];

    _LabelTitle->clear();
    _LabelTitle->drawText(0, 0, 2.0f, "Dealer Display");

    _LabelLevel->clear();
    snprintf(buffer, sizeof(buffer), "Level %02d", _DisplayLevel);
    _LabelLevel->drawText(0, 0, buffer);

    _LabelBlind->clear();
    snprintf(buffer, sizeof(buffer), "SB %d / BB %d", _DisplaySB, _DisplayBB);
    _LabelBlind->drawText(0, 0, buffer);

    _LabelSeatHeader->clear();
    _LabelSeatHeader->drawText(0, 0, "Seats");

    for(int row=0; row<3; ++row)
    {
        const int seat_index = row * 3;
        _LabelSeatStatus[row]->clear();
        snprintf(
            buffer,
            sizeof(buffer),
            "%02d %-2s   %02d %-2s   %02d %-2s",
            seat_index + 1, getSeatDisplayStatus(_SeatStatus[seat_index + 0]),
            seat_index + 2, getSeatDisplayStatus(_SeatStatus[seat_index + 1]),
            seat_index + 3, getSeatDisplayStatus(_SeatStatus[seat_index + 2]));
        _LabelSeatStatus[row]->drawText(0, 0, buffer);
    }

    _LabelBoardHeader->clear();
    _LabelBoardHeader->drawText(0, 0, "Board");

    char *seek = board_buffer;
    seek[0] = '\0';
    for(int index=0; index<5; ++index)
    {
        if(index > 0)
        {
            seek += snprintf(seek, sizeof(board_buffer) - (seek - board_buffer), " ");
        }
        formatCardLabel(_BoardCards[index], card_buffer, sizeof(card_buffer));
        seek += snprintf(seek, sizeof(board_buffer) - (seek - board_buffer), "%s", card_buffer);
    }
    _LabelBoard->clear();
    _LabelBoard->drawText(0, 0, board_buffer);

    _LabelLastRx->clear();
    snprintf(
        buffer,
        sizeof(buffer),
        "Last RX: %02lu:%02lu:%02lu",
        (_LastRxMillis / 3600000UL) % 24UL,
        (_LastRxMillis / 60000UL) % 60UL,
        (_LastRxMillis / 1000UL) % 60UL);
    _LabelLastRx->drawText(0, 0, buffer);
}


void AppModeCenterMonitor::updateSeatStatusFromSetting(SysSetting *setting, int seat_index)
{
    char key[16];
    snprintf(key, sizeof(key), "SEAT%02d", seat_index + 1);
    String value = setting->get(key);
    if(value == "OK")
    {
        strcpy(_SeatStatus[seat_index], "OK");
    }
    else if(value == "NO")
    {
        strcpy(_SeatStatus[seat_index], "NO");
    }
    else
    {
        strcpy(_SeatStatus[seat_index], "DEAD");
    }
}


void AppModeCenterMonitor::updateBoardCardFromSetting(SysSetting *setting, int board_index)
{
    char key[16];
    snprintf(key, sizeof(key), "BOARD%02d", board_index + 1);
    _BoardCards[board_index] = setting->getAsInt(key);
}
