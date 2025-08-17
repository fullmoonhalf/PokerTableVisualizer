#ifndef _INCLUDED_APP_CARD_LISTENER_MULTI_RFID2
#define _INCLUDED_APP_CARD_LISTENER_MULTI_RFID2
//
#include "ClosedCube_TCA9548A.h"
//
#include "UnitRfid2Driver.h"
#include "MFRC522_I2C.h"
#include "AppCardListener.h"
#include "AppCardListenerUnitRfid2Base.h"
#include "SysI2CUtil.h"


#define RFID_READER_COUNT (6)  // Slot の数
#define PaHub_I2C_ADDRESS 0x70



class AppCardListenerMultiRfid2 : public AppCardListenerUnitRfid2Base
{
public:
    AppCardListenerMultiRfid2();
    ~AppCardListenerMultiRfid2();

    virtual bool init();
    virtual bool scan(int timeout = 500);
    virtual int scanWithInfo(int timeout, AppCardInfo *outBuffer);
    virtual int encode(char *outBuffer);

private:
    bool switchTcaChannel(int channel);

    SysI2CUtil _I2C;
    MFRC522 *_MFRC522;
    ClosedCube::Wired::TCA9548A _TCA;
    AppCardInfo _CardInfo[8];
    int _CardCount = 0;
    bool _ValidSlot[RFID_READER_COUNT];
};


#endif // _INCLUDED_APP_CARD_LISTENER_MULTI_RFID2
