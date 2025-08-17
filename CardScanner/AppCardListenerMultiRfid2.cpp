#include "SysUtils.h"
#include "SysLog.h"
#include "AppCardListenerMultiRfid2.h"
#define PaHub_I2C_ADDRESS 0x70


AppCardListenerMultiRfid2::AppCardListenerMultiRfid2()
{

}

AppCardListenerMultiRfid2::~AppCardListenerMultiRfid2()
{

}

bool AppCardListenerMultiRfid2::init()
{
    // RFID 通信ユーティリティオブジェクト
    _MFRC522 = new MFRC522(MFRC522_CHIP_ADDRESS, false);

    // Hub につながっているデバイスを初期化していく。
    _TCA.address(PaHub_I2C_ADDRESS);
    for (uint8_t t = 0; t < RFID_READER_COUNT; t++) {
        _ValidSlot[t] = false;

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



bool AppCardListenerMultiRfid2::scan(int timeout)
{
    _CardCount = 0;
    for (uint8_t t = 0; t < RFID_READER_COUNT; t++) {
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

        int count;
        if(_scan(_MFRC522, timeout, _CardInfo+_CardCount, &count))
        {
            _CardCount += count;
        }
    }

    _dump(_CardInfo, _CardCount);

    return _CardCount > 0;
}

int AppCardListenerMultiRfid2::scanWithInfo(int timeout, AppCardInfo *outBuffer)
{
    return 0;
}


bool AppCardListenerMultiRfid2::switchTcaChannel(int channel)
{
    return _I2C.setReadRegister(PaHub_I2C_ADDRESS, 1 << channel);
}
