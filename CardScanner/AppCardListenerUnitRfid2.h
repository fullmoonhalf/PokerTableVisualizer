#ifndef _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2
#define _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2
#include "UnitRfid2Driver.h"
#include "MFRC522_I2C.h"
#include "AppCardListener.h"
#include "AppCardListenerUnitRfid2Base.h"


class AppCardListenerUnitRfid2 : public AppCardListenerUnitRfid2Base
{
public:
    AppCardListenerUnitRfid2();
    ~AppCardListenerUnitRfid2();

    virtual bool init();
    virtual bool scan(int timeout = 500);
    virtual int scanWithInfo(int timeout, AppCardInfo *outBuffer);
    virtual int encode(char *outBuffer);

    void dump();
    bool write(int page, uint8_t *data, int size, int timeout);

private:
    MFRC522 *_MFRC522;
    AppCardInfo _CardInfo[8];
    int _CardCount = 0;
};


#endif // _INCLUDED_APP_CARD_LISTENER_UNIT_RFID2
