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
    dump();
#endif
    return _CardCount > 0;
}


int AppCardListenerUnitRfid2::scanWithInfo(int timeout, AppCardInfo *outBuffer)
{
    return _scanWithInfo(_MFRC522, timeout, outBuffer);
}


/// @brief 外部に渡す用のエンコード
/// @param buffer 
/// @return 
int AppCardListenerUnitRfid2::encode(char *buffer)
{
    char *seek = buffer;
    seek += sprintf(seek, "cards:[");
    const char *delim = "";
    for(int slot_index=0; slot_index<_CardCount; ++slot_index)
    {
        AppCardInfo &slot = _CardInfo[slot_index];
        seek += sprintf(seek, "%s%d", delim, slot.info[1]);
        delim = ",";
    }
    seek += sprintf(seek, "]");
    return seek - buffer;
}


/// @brief 原状のダンプ
void AppCardListenerUnitRfid2::dump()
{
    SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2), "Detect %d card(s)", _CardCount);
    for(int slot_index=0; slot_index<_CardCount; ++slot_index)
    {
        AppCardInfo &slot = _CardInfo[slot_index];
        char buffer[256];
        char *seek = buffer;
        seek += sprintf(seek, "[%d] UID:", slot_index);
        for (int i = 0; i < slot.size; ++i)
        {
            seek += sprintf(seek, "%02X", slot.uid[i]);
        }
        seek += sprintf(seek, ": info %02X %02X %02X %02X", slot.info[0], slot.info[1], slot.info[2], slot.info[3]);
        SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2), buffer);
    }
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
