#define VERBOSE_ERROR (3)
#define VERBOSE_INFO (2)
#define VERBOSE_DETAIL (1)
#define VERBOSE_NONE (0)
#define VERBOSE (VERBOSE_NONE)
#define VERBOSE_CHECK(x)  ((VERBOSE) >= (x))
#include "SysUtils.h"
#include "SysLog.h"
#include "AppCardListenerUnitRfid2Base.h"



bool AppCardListenerUnitRfid2Base::_init(MFRC522 *m)
{
    m->PCD_Init();
    return true;
}


bool AppCardListenerUnitRfid2Base::_scan(MFRC522 *m, int timeout, AppCardInfo *outBuffer, int *outCount)
{
#if VERBOSE_CHECK(VERBOSE_DETAIL)
    SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), "scan - resetAntenna");
#endif
    if(resetAntenna(m) == false)
    {
        return false;
    }
#if VERBOSE_CHECK(VERBOSE_DETAIL)
    SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), "scan - wakeup");
#endif
    if(wakeup(m) == false)
    {
        return false;
    }
#if VERBOSE_CHECK(VERBOSE_DETAIL)
    SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), "scan - scanCards");
#endif
    if(scanCards(m, timeout, outBuffer, outCount) == false)
    {
        return false;
    }

    return *outCount > 0;
}


int AppCardListenerUnitRfid2Base::_scanWithInfo(MFRC522 *m, int timeout, AppCardInfo *outBuffer)
{
    int Count = 0;
    if(_scan(m, timeout, outBuffer, &Count))
    {
        return Count;
    }

    return 0;
}


/// @brief アンテナのリセット
/// @param m 
/// @return 
bool AppCardListenerUnitRfid2Base::resetAntenna(MFRC522 *m)
{
    m->PCD_AntennaOff();
    delay(8);                                   // 5ms以上目安
    m->PCD_AntennaOn();
    m->PCD_SetAntennaGain(MFRC522::RxGain_max); // 任意：感度を最大に
    delay(5);

    return true;
}


/// @brief タグ側のリセット
/// @param m 
/// @return 
bool AppCardListenerUnitRfid2Base::wakeup(MFRC522 *m)
{
    // 念のため暗号セッション終了
    m->PCD_StopCrypto1();

    // 起床ブロードキャスト（衝突=STATUS_COLLISIONでもOK。起きれば目的達成）
    byte atqa[2]; byte len = 2;
    auto status = m->PICC_WakeupA(atqa, &len);
    delay(5);

    switch(status)
    {
        case MFRC522::STATUS_OK:
        case MFRC522::STATUS_COLLISION:
            return true;
        default:
#if VERBOSE_CHECK(VERBOSE_ERROR)
            {
                String error_code = m->GetStatusCodeName(status);
                SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), "wakeup: select failure %d - %s", status, error_code.c_str());
            }
#endif
        return false;

    }
}


bool AppCardListenerUnitRfid2Base::scanCards(MFRC522 *m, int timeout, AppCardInfo *outBuffer, int *outCount)
{
#if VERBOSE_CHECK(VERBOSE_INFO)
    int loop_count = 0;
#endif
    *outCount = 0;
    uint32_t until = millis() + timeout;
    for(;;)
    {
#if VERBOSE_CHECK(VERBOSE_INFO)
        loop_count++;
#endif
        if(millis() > until) 
        {
            break;
        }
        if(scanOneCardOnce(m, &outBuffer[*outCount]))   // 1枚処理→Halt→次の1枚…の繰り返し
        {
            *outCount += 1;
        }
    }

#if VERBOSE_CHECK(VERBOSE_INFO)
    SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), "scan loop_count %d", loop_count);
#endif

    return true;
}


/// @brief 1 つのカードのスキャン
/// @param m 
/// @return 
bool AppCardListenerUnitRfid2Base::scanOneCardOnce(MFRC522 *m, AppCardInfo *slot)
{
    if (!m->PICC_IsNewCardPresent()) return false;
    if (!m->PICC_ReadCardSerial())   return false;

    for (int i = 0; i < m->uid.size; ++i)
    {
        slot->uid[i] = m->uid.uidByte[i];
    }
    slot->size = m->uid.size;
    slot->uid_checksum = calcUidChecksum(m->uid.uidByte, m->uid.size);

    // メモリリード
    {
        byte buf[18]; 
        byte sz = sizeof(buf);
        auto status = m->MIFARE_Read(4, buf, &sz);  // 4ページ=16B まとめ読み
        switch(status)
        {
            case MFRC522::STATUS_OK:
                slot->info[0] = buf[0];
                slot->info[1] = buf[1];
                break;
            default:
                {
#if VERBOSE_CHECK(VERBOSE_ERROR)
                    String error_code = m->GetStatusCodeName(status);
                    SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), "readOneCardOnce: read failure %d - %s", status, error_code.c_str());
#endif
                }
                break;
        }
    }

    // 後始末
    m->PICC_HaltA();       // このカードを停止
    m->PCD_StopCrypto1();  // MIFARE Classic の暗号化セッション終了

    return true;
}


/// @brief  ユーザー領域にかきこみ
/// @param page 
/// @param data 
/// @param size 
/// @return 
bool AppCardListenerUnitRfid2Base::_write(MFRC522 *m, uint page, uint8_t *data, int size, int timeout)
{
    uint32_t until = millis() + timeout;
    for(;;)
    {
        if(millis() > until) 
        {
            break;
        }
        if(writeOnce(m, page, data, size))
        {
            return true;
        }
    }

    return false;
}


/// @brief かきこみ
/// @param page 
/// @param data 
/// @param size 
/// @return 
bool AppCardListenerUnitRfid2Base::writeOnce(MFRC522 *m, uint page, uint8_t *data, int size)
{
    if(page < 4) return false;
    if (!m->PICC_IsNewCardPresent()) return false;
    if (!m->PICC_ReadCardSerial())   return false;

    auto status = m->MIFARE_Ultralight_Write(page, data, 4);
    m->PICC_HaltA();

    return (status == MFRC522::STATUS_OK);
}


/// @brief 
/// @param test_uid 
/// @param test_uid_length 
/// @return 
uint8_t AppCardListenerUnitRfid2Base::calcUidChecksum(uint8_t *test_uid, int test_uid_length)
{
    uint8_t checksum = 0;
    for (int i = 0; i < test_uid_length; ++i)
    {
        checksum = (checksum + test_uid[i]) & 0xff;
    }
    return checksum;
}


/// @brief 原状のダンプ
void AppCardListenerUnitRfid2Base::_dump(AppCardInfo *infos, int Count)
{
    SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), "Detect %d card(s)", Count);
    for(int slot_index=0; slot_index<Count; ++slot_index)
    {
        AppCardInfo &slot = infos[slot_index];
        char buffer[256];
        char *seek = buffer;
        seek += sprintf(seek, "[%d] UID:", slot_index);
        for (int i = 0; i < slot.size; ++i)
        {
            seek += sprintf(seek, "%02X", slot.uid[i]);
        }
        seek += sprintf(seek, ": info %02X %02X %02X %02X", slot.info[0], slot.info[1], slot.info[2], slot.info[3]);
        SysLog::printf(__NAMEOF__(AppCardListenerUnitRfid2Base), buffer);
    }
}


