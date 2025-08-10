#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppModeDevelop.h"
#include "SysLog.h"


void AppModeDevelop::start()
{
    _FrameCount = 0;
    SysDisplay::getInstance().clear();
 
    _MFRC522 = new MFRC522(MFRC522_CHIP_ADDRESS, false);
    _MFRC522->PCD_Init();

    _Gauge = SysSpriteManager::getInstance().createGauge(128, 8, 0, 200);
}

void AppModeDevelop::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_Gauge);
}

void AppModeDevelop::update()
{
    _FrameCount++;

    //
    uint32_t until = millis() + 150;           // 例: 150msのスキャン
    while (millis() < until) {
        readOneCardOnce(_MFRC522);   // 1枚処理→Halt→次の1枚…の繰り返し
    }

    // ゲージ(デバイス生きてるのか確認する用)
    _Gauge->setCurrentValue(_FrameCount % 200);
    _Gauge->update();
}


bool AppModeDevelop::readOneCardOnce(MFRC522 *m)
{
    if (!m->PICC_IsNewCardPresent()) return false;
    if (!m->PICC_ReadCardSerial())   return false;

    // ここでUIDが m.uid.uidByte[0..m.uid.size-1]
    char buffer[256];
    char *seek = buffer;
    seek += sprintf(seek, "UID:");
    for (int i = 0; i < m->uid.size; ++i)
    {
        seek += sprintf(seek, " %02X", m->uid.uidByte[i]);
    }
    SysLog::printf(__NAMEOF__(AppModeDevelop), buffer);

    // 必要ならここで READ/WRITE/認証などの処理

    m->PICC_HaltA();       // このカードを停止
    m->PCD_StopCrypto1();  // MIFARE Classic の暗号化セッション終了
    return true;
}



void AppModeDevelop::draw()
{
    _Gauge->draw(8, 8);
}
