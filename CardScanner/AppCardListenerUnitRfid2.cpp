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
    _MFRC522->PCD_Init();
    return true;
}


bool AppCardListenerUnitRfid2::scan()
{
    if(resetAntenna(_MFRC522) == false)
    {
        return false;
    }
    if(rescanAll(_MFRC522) == false)
    {
        return false;
    }
    if(readCards(_MFRC522, 500) == false)
    {
        return false;
    }
    
    return _CardCount > 0;
}


/// @brief アンテナのリセット
/// @param m 
/// @return 
bool AppCardListenerUnitRfid2::resetAntenna(MFRC522 *m)
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
bool AppCardListenerUnitRfid2::rescanAll(MFRC522 *m)
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
            return false;
    }
}


bool AppCardListenerUnitRfid2::readCards(MFRC522 *m, int span)
{
    _CardCount = 0;
    uint32_t until = millis() + span;
    for(;;)
    {
        if(millis() > until) 
        {
            break;
        }
        if(readOneCardOnce(_MFRC522))   // 1枚処理→Halt→次の1枚…の繰り返し
        {
            _CardCount++;
            if(_CardCount >= __ARRAY_SIZE__(_CardInfo))
            {
                break;
            }
        }
    }

    return true;
}


bool AppCardListenerUnitRfid2::readOneCardOnce(MFRC522 *m)
{
    if (!m->PICC_IsNewCardPresent()) return false;
    if (!m->PICC_ReadCardSerial())   return false;

    AppCardInfo &slot = _CardInfo[_CardCount];
    for (int i = 0; i < m->uid.size; ++i)
    {
        slot.uid[i] = m->uid.uidByte[i];
    }
    slot.size = m->uid.size;

    m->PICC_HaltA();       // このカードを停止
    m->PCD_StopCrypto1();  // MIFARE Classic の暗号化セッション終了
    return true;
}


int AppCardListenerUnitRfid2::encode(char *buffer)
{
    char *seek = buffer;
    seek += sprintf(seek, "cards:[");
    const char *delim = "";
    for(int slot_index=0; slot_index<_CardCount; ++slot_index)
    {
        AppCardInfo &slot = _CardInfo[slot_index];
        seek += sprintf(seek, "%s\"", delim);
        for (int i = 0; i < slot.size; ++i)
        {
            seek += sprintf(seek, "%02X", slot.uid[i]);
        }
        seek += sprintf(seek, "\"");
        delim = ",";
    }
    seek += sprintf(seek, "]");
    return seek - buffer;
}


/// @brief 原状のダンプ
void AppCardListenerUnitRfid2::dump()
{
    SysLog::printf(__NAMEOF__(AppModeDevelop), "Detect %d card(s)", _CardCount);
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
        SysLog::printf(__NAMEOF__(AppModeDevelop), buffer);
    }
}
