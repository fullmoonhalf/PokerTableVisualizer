#ifndef _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2
#define _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2
#include "AppCardListener.h"
#include "UnitRfid2Driver.h"
#include "MFRC522_I2C.h"


class AppCardListenerUnitRfid2 : public AppCardListener
{
public:
    AppCardListenerUnitRfid2();
    ~AppCardListenerUnitRfid2();

    bool init();
    bool scan();
    int scanWithInfo(AppCardInfo *outBuffer);
    void dump();
    int encode(char *buffer);
    bool write(int page, uint8_t *data, int size, int timeout);

private:
    bool resetAntenna(MFRC522 *m);
    bool rescanAll(MFRC522 *m);
    bool readCards(MFRC522 *m, int span);
    bool readOneCardOnce(MFRC522 *m);
    bool writeOnce(int page, uint8_t *data, int size);

    MFRC522 *_MFRC522;
    AppCardInfo _CardInfo[8];
    int _CardCount = 0;
};


#endif // _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2
