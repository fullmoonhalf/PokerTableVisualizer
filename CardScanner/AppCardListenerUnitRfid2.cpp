#define VERBOSE_ERROR (3)
#define VERBOSE_INFO (2)
#define VERBOSE_DETAIL (1)
#define VERBOSE (VERBOSE_INFO)
#define VERBOSE_CHECK(x)  ((VERBOSE) >= (x))
#include "SysUtils.h"
#include "SysLog.h"
#include "AppCardListenerUnitRfid2.h"



AppCardListenerUnitRfid2::AppCardListenerUnitRfid2()
{
}

AppCardListenerUnitRfid2::~AppCardListenerUnitRfid2()
{
}

bool AppCardListenerUnitRfid2::init()
{
    _MFRC522 = new MFRC522(MFRC522_CHIP_ADDRESS, false);
    return _init(_MFRC522);
}


bool AppCardListenerUnitRfid2::scan(int timeout)
{
    return _scan(_MFRC522, timeout, _CardInfo, &_CardCount);
#if VERBOSE_CHECK(VERBOSE_INFO)
    _dump(_CardInfo, _CardCount);
#endif
    return _CardCount > 0;
}


int AppCardListenerUnitRfid2::scanWithInfo(int timeout, AppCardInfo *outBuffer)
{
    return _scanWithInfo(_MFRC522, timeout, outBuffer);
}


/// @brief  ユーザー領域にかきこみ
/// @param page 
/// @param data 
/// @param size 
/// @return 
bool AppCardListenerUnitRfid2::write(int page, uint8_t *data, int size, int timeout)
{
    return _write(_MFRC522, page, data, size, timeout);
}


/// @brief エンコード
/// @param outBuffer 
/// @return 
int AppCardListenerUnitRfid2::encode(char *outBuffer)
{
    return _encode(outBuffer, _CardInfo, _CardCount);
}


/// @brief センサーの数
/// @return 
int AppCardListenerUnitRfid2::getSensorCount()
{
    return 1;
}


/// @brief センサーの状態文字列の取得
/// @param buffer 
/// @return 
bool AppCardListenerUnitRfid2::getSensorStatus(int index, char *buffer)
{
    return false;
}
