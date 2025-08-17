#ifndef _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2_BASE
#define _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2_BASE
#include "AppCardListener.h"
#include "UnitRfid2Driver.h"
#include "MFRC522_I2C.h"


class AppCardListenerUnitRfid2Base : public AppCardListener
{
protected:
    bool _init(MFRC522 *m);
    bool _scan(MFRC522 *m, int timeout, AppCardInfo *outBuffer, int *outCount);
    int _scanWithInfo(MFRC522 *m, int timeout, AppCardInfo *outBuffer);
    bool _write(MFRC522 *m, uint page, uint8_t *data, int size, int timeout);

private:
    bool resetAntenna(MFRC522 *m);
    bool wakeup(MFRC522 *m);
    bool scanCards(MFRC522 *m, int timeout, AppCardInfo *outBuffer, int *outCount);
    bool scanOneCardOnce(MFRC522 *m, AppCardInfo *slot);

    uint8_t calcUidChecksum(uint8_t *test_uid, int test_uid_length);
    bool writeOnce(MFRC522 *m, uint page, uint8_t *data, int size);
};


#endif // _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2_BASE
