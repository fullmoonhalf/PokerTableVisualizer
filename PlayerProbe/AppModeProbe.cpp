#include "SysUtils.h"
#include "AppModeProbe.h"
#include "AppSetting.h"
#include "UhfRfidFrameParser.h"

#define SEND_VIEW_WIDTH (128)
#define SEND_VIEW_HEIGHT (128)


void AppModeProbe::init(UhfRfidDriver *argUhfRfidDriver, AppDisplay *argDisplay, AppReporter *argReporter, const char *argProbeName, int argCardCapacity)
{
    // コンテキストの初期化
    _Context._RefUhfRfidDriver = argUhfRfidDriver;
    _Context._RefDisplay = argDisplay;
    _Context._RefReporter = argReporter;
    strncpy(_Context.ProbeName, argProbeName, sizeof(_Context.ProbeName));
    _Context.ProbeName[sizeof(_Context.ProbeName)-1] = '\0';
    _Context.SendCapacity = argCardCapacity;

    for(int index=0; index<__ARRAY_SIZE__(_Context.SendInfo); ++index)
    {
        auto info = _Context.SendInfo + index;
        info->Capacity = argCardCapacity * 2;
        info->CardInfoList = new AppModeProbeCardInfo[info->Capacity];
    }

    // 紐付け
    _Context._RefUhfRfidDriver->regist(this, UhfRfidCommand::UhfRfidCommand_SinglePollingInstruction);
    _Context._RefReporter->bind(this);

    // ステータスパネル
    _Context._StatusPanel = new AppStatusPanel(_Context._RefDisplay);
    _Context._StatusPanel->setup();
    _Context._StatusPanel->bind(_Context._RefUhfRfidDriver);
    _Context._StatusPanel->bind(_Context._RefReporter);
    _Context._StatusPanel->dumpMemoryStatus();

    _Context._SpriteProbeName = _Context._RefDisplay->createSprite(64, 16);
    _Context._SpriteProbeName->drawString(_Context.ProbeName, 0, 0);

    _Context._SpriteProbeMode = _Context._RefDisplay->createSprite(64, 16);
    _Context._SpriteProbeMode->drawString("Probe", 0, 0);

    _Context._SpriteSendView = _Context._RefDisplay->createSprite(SEND_VIEW_WIDTH, SEND_VIEW_HEIGHT);
    _Context._SpriteSendView->setFont(&fonts::Font2);
}


/// @brief 更新
void AppModeProbe::update()
{
    _Context.FrameCount++;
    if(_Context.FrameCount % 10 == 0)
    {
        // バッファを切り替える。
        {
            _Context.CurrentSendIndex = _Context.CurrentRecvIndex;
            _Context.CurrentRecvIndex = _Context.CurrentRecvIndex == 0 ? 1 : 0;
            auto info = _Context.SendInfo + _Context.CurrentRecvIndex;
            info->CurrentNum = 0;
        }

        // 送信内容の表示
        {
            char buffer[32];
            auto info = _Context.SendInfo + _Context.CurrentSendIndex;
            int y = 0;
            _Context._SpriteSendView->fillRect(0, 0, SEND_VIEW_WIDTH, SEND_VIEW_HEIGHT, TFT_BLACK);
            for(int index=0; index<info->CurrentNum; ++index)
            {
                auto slot = info->CardInfoList + index;
                sprintf(buffer, "[%2d] rssi %d", index, slot->RSSI);
                _Context._SpriteSendView->drawString(buffer, 0, y);
                y += 16;
                if( y > SEND_VIEW_HEIGHT)
                {
                    break;
                }
            }
        }

#if 0
        {
            char buffer[256];
            auto length = tryGetStatus(buffer);
            if(length > 0)
            {
                Serial.printf("AppModeProbe::update: %s\r\n", buffer);
            }
        }
#endif

        // ポーリング命令を送出。
        _Context._RefUhfRfidDriver->commandSinglePollingInstruction();
    }

    _Context._StatusPanel->update();
    _Context._RefReporter->update();
}


/// @brief 描画
void AppModeProbe::draw()
{
    _Context._StatusPanel->draw(10, 10);
    _Context._SpriteProbeMode->pushSprite(128, 10);
    _Context._SpriteProbeName->pushSprite(128, 20);
    _Context._SpriteSendView->pushSprite(10, 64);
    }


/// @brief RFID タグ読み取り情報取得
/// @param frame 
void AppModeProbe::onReceive(UhfRfidFrame *frame)
{
    UhfRfidNotifyPollingParser parser(frame);
    uint8_t *epc = parser.getEPC();
    uint8_t deck_index = epc[10];
    uint8_t card_index = epc[11];
    uint16_t rssi = parser.getRSSI();

    if(AppEPCCheck(epc))
    {
        auto info = _Context.SendInfo + _Context.CurrentRecvIndex;
        if(info->CurrentNum < info->Capacity)
        {
            // RSSI の降順になるように並べる
            AppModeProbeCardInfo floating;
            floating.DeckIndex = deck_index;
            floating.CardIndex = card_index;
            floating.RSSI = rssi;

            for(int index=0; index<info->CurrentNum; ++index)
            {
                auto slot = info->CardInfoList + index;
                if(floating.RSSI > slot->RSSI)
                {
                    AppModeProbeCardInfo temp = floating;
                    floating = *slot;
                    *slot = temp;
                }
            }

            auto append = info->CardInfoList + info->CurrentNum;
            *append = floating;
            info->CurrentNum++;
        }
#if 0
        Serial.printf("AppModeProbe::onReceive deck=%d card=%d - recv %d %d/%d\r\n", deck_index, card_index, _Context.CurrentRecvIndex, info->CurrentNum, info->Capacity);
#endif
    }
}


/// @brief BLE 情報取得
/// @param buffer 
/// @return 
int AppModeProbe::tryGetStatus(char *buffer)
{
    // 送るものはない。
    if(_Context.CurrentSendIndex < 0)
    {
        return 0;
    }

    auto seek = buffer;
    seek += sprintf(seek, "{\"probe\":\"%s\",\"cards\":[", _Context.ProbeName);

    auto info = _Context.SendInfo + _Context.CurrentSendIndex;
    int length = info->CurrentNum < _Context.SendCapacity ? info->CurrentNum : _Context.SendCapacity;
    for(int index=0; index<length; ++index)
    {
        auto slot = info->CardInfoList + index;
        const char *delim = index < length - 1 ? ",": ""; 
        seek += sprintf(seek, "{\"deck\":%d,\"card\":%d,\"rssi\":%d}%s", slot->DeckIndex, slot->CardIndex, slot->RSSI, delim);
    }

    seek += sprintf(seek, "]}");

    return seek - buffer;
}


/// @brief BLE 送信情報のフラッシュ
void AppModeProbe::flushSource()
{
    _Context.CurrentSendIndex = -1;
}
