#include "SysUtils.h"
#include "SysLog.h"
#include "AppCardListenerMultiRfid2.h"
#define PaHub_I2C_ADDRESS 0x70
#define RFID_READER_COUNT 5  // 利用するRFIDリーダーの数


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
        _init(_MFRC522);
    }

    return false;
}



bool AppCardListenerMultiRfid2::scan(int timeout)
{
    return false;
}

int AppCardListenerMultiRfid2::scanWithInfo(int timeout, AppCardInfo *outBuffer)
{
    return 0;
}


bool AppCardListenerMultiRfid2::switchTcaChannel(int channel)
{
    return _I2C.setReadRegister(PaHub_I2C_ADDRESS, 1 << channel);
}
