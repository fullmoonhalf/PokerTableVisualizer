#ifndef _INCLUDED_APP_CARD_LISTENER_MULTI_RFID2
#define _INCLUDED_APP_CARD_LISTENER_MULTI_RFID2
#include "AppCardListener.h"
#include "UnitRfid2Driver.h"
#include "MFRC522_I2C.h"


class AppCardListenerUnitRfid2 : public AppCardListener
{
public:
    AppCardListenerUnitRfid2();
    ~AppCardListenerUnitRfid2();

    bool init();
    bool scan(int timeout = 500);
    int scanWithInfo(AppCardInfo *outBuffer);
    void dump();
    int encode(char *buffer);

private:
    bool resetAntenna(MFRC522 *m);
    bool wakeup(MFRC522 *m);
    bool scanCards(MFRC522 *m, int span);
    bool scanOneCardOnce(MFRC522 *m);
    bool readCards(MFRC522 *m);
    bool readOneCardOnce(MFRC522 *m, AppCardInfo *card);
    bool isScanned(uint8_t *test_uid, int test_uid_length, uint8_t checksum);
    uint8_t calcUidChecksum(uint8_t *test_uid, int test_uid_length);

    bool writeOnce(int page, uint8_t *data, int size);

    MFRC522 *_MFRC522;
    AppCardInfo _CardInfo[8];
    int _CardCount = 0;
};


#endif // _INCLUDED_APP_CARD_LISTENER_MULTI_RFID2
