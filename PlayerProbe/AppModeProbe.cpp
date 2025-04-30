#include "SysUtils.h"
#include "AppModeProbe.h"
#include "UhfRfidFrameParser.h"



void AppModeProbe::init(UhfRfidDriver *argUhfRfidDriver, AppDisplay *argDisplay, AppReporter *argReporter, const char *argProbeName, int argCardCapacity)
{
    // コンテキストの初期化
    _Context._RefUhfRfidDriver = argUhfRfidDriver;
    _Context._RefDisplay = argDisplay;
    _Context._RefReporter = argReporter;
    strncpy(_Context.ProbeName, argProbeName, sizeof(_Context.ProbeName));
    _Context.ProbeName[sizeof(_Context.ProbeName)-1] = '\0';

    for(int index=0; index<__ARRAY_SIZE__(_Context.SendInfo); ++index)
    {
        auto info = _Context.SendInfo + index;
        info->CardInfoList = new AppModeProbeCardInfo[argCardCapacity];
        info->Capacity = argCardCapacity;
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
}


/// @brief 更新
void AppModeProbe::update()
{
    _Context.FrameCount++;
    if(_Context.FrameCount % 10 == 0)
    {
        // バッファを切り替える。
        _Context.CurrentSendIndex = _Context.CurrentRecvIndex;
        _Context.CurrentRecvIndex = _Context.CurrentRecvIndex == 0 ? 1 : 0;
        auto info = _Context.SendInfo + _Context.CurrentRecvIndex;
        info->CurrentNum = 0;

        {
            char buffer[256];
            auto length = tryGetStatus(buffer);
            if(length > 0)
            {
                Serial.printf("AppModeProbe::update: %s\r\n", buffer);
            }
        }

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
}


/// @brief RFID タグ読み取り情報取得
/// @param frame 
void AppModeProbe::onReceive(UhfRfidFrame *frame)
{
    UhfRfidNotifyPollingParser parser(frame);
    uint8_t *epc = parser.getEPC();
    uint8_t deck_index = epc[10];
    uint8_t card_index = epc[11];

    auto info = _Context.SendInfo + _Context.CurrentRecvIndex;
    if(info->CurrentNum < info->Capacity)
    {
        auto slot = info->CardInfoList + info->CurrentNum;
        slot->DeckIndex = deck_index;
        slot->CardIndex = card_index;
        info->CurrentNum++;
    }
    Serial.printf("AppModeProbe::onReceive deck=%d card=%d - recv %d %d/%d\r\n", deck_index, card_index, _Context.CurrentRecvIndex, info->CurrentNum, info->Capacity);
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
    seek += sprintf(seek, "{probe: \"%s\",cards:[", _Context.ProbeName);

    auto info = _Context.SendInfo + _Context.CurrentSendIndex;
    for(int index=0; index<info->CurrentNum; ++index)
    {
        auto slot = info->CardInfoList + index;
        const char *delim = index < info->CurrentNum - 1 ? ",": ""; 
        seek += sprintf(seek, "{deck:%d, card:%d}%s", slot->DeckIndex, slot->CardIndex, delim);
    }

    seek += sprintf(seek, "]}");

    return seek - buffer;
}


/// @brief BLE 送信情報のフラッシュ
void AppModeProbe::flushSource()
{
    _Context.CurrentSendIndex = -1;
}
