#include "SysUtils.h"
#include "SysLog.h"
#include "AppCardListenerMultiRfid2.h"


AppCardListenerMultiRfid2::AppCardListenerMultiRfid2()
{
}


AppCardListenerMultiRfid2::~AppCardListenerMultiRfid2()
{
}


/// @brief 初期化
/// @return 成否
bool AppCardListenerMultiRfid2::init()
{
    // RFID 通信ユーティリティオブジェクト
    _MFRC522 = new MFRC522(MFRC522_CHIP_ADDRESS, false);

    // Hub につながっているデバイスを初期化していく。
    _TCA.address(PaHub_I2C_ADDRESS);
    for (uint8_t t = 0; t < RFID_READER_COUNT; t++) {
        _ValidSlot[t] = false;
        _ReadCount[t] = 0;

        // チャンネルを合わせて
        bool result_switch = switchTcaChannel(t);
        if(result_switch == false)
        {
            SysLog::printf(__NAMEOF__(AppCardListenerMultiRfid2), "error: %d switchTcaChannel", t);
            continue;
        }

        // 生きているのを確認して
        bool result_alive = _I2C.checkAlive(MFRC522_CHIP_ADDRESS);
        if(result_alive == false)
        {
            SysLog::printf(__NAMEOF__(AppCardListenerMultiRfid2), "error: %d checkAlive", t);
            continue;
        }

        // 初期化
        SysLog::printf(__NAMEOF__(AppCardListenerMultiRfid2), "Init device: %d", t);
        _ValidSlot[t] = _init(_MFRC522);
    }

    return false;
}


/// @brief スキャン
/// @param timeout 探索時間[ms]
/// @return 検出したカード枚数
bool AppCardListenerMultiRfid2::scan(int timeout)
{
    _CardCount = 0;
    for (uint8_t t = 0; t < RFID_READER_COUNT; t++) {
        _ReadCount[t] = 0;
        if(_ValidSlot[t] == false)
        {
            continue;
        }

        // チャンネルを合わせて
        bool result_switch = switchTcaChannel(t);
        if(result_switch == false)
        {
            SysLog::printf(__NAMEOF__(AppCardListenerMultiRfid2), "error: %d switchTcaChannel", t);
            continue;
        }

        int count = 0;
        if(_scan(_MFRC522, timeout, _CardInfo+_CardCount, &count))
        {
            _ReadCount[t] = count;
            _CardCount += count;
        }
    }

    return _CardCount > 0;
}


/// @brief スキャン
/// @param timeout 探索時間[ms]
/// @param outBuffer 情報返しバッファ
/// @return 検出したカード枚数
int AppCardListenerMultiRfid2::scanWithInfo(int timeout, AppCardInfo *outBuffer)
{
    _CardCount = 0;
    if(scan(timeout))
    {
        for(int index=0; index<_CardCount; ++index)
        {
            outBuffer[index] = _CardInfo[index];
        }
    }
    return _CardCount;
}


/// @brief ハブの対象スイッチ切り替え
/// @param channel 対象チャネル
/// @return 成否
bool AppCardListenerMultiRfid2::switchTcaChannel(int channel)
{
    return _I2C.setReadRegister(PaHub_I2C_ADDRESS, 1 << channel);
}


/// @brief エンコード
/// @param outBuffer 
/// @return 
int AppCardListenerMultiRfid2::encode(char *outBuffer)
{
    return _encode(outBuffer, _CardInfo, _CardCount);
}


/// @brief センサーの数
/// @return 
int AppCardListenerMultiRfid2::getSensorCount()
{
    return RFID_READER_COUNT;
}


/// @brief センサーの状態文字列の取得
/// @param buffer 
/// @return 
bool AppCardListenerMultiRfid2::getSensorStatus(int index, char *buffer)
{
    char *seek = buffer;
    if(_ValidSlot[index])
    {
        seek += sprintf(seek, "VALID - read %d", _ReadCount[index]);
    }
    else
    {
        seek += sprintf(seek, "invalid");
    }
    return _ValidSlot[index];
}
