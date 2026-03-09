#ifndef __UHF_RFID_PAESER_H_
#define __UHF_RFID_PAESER_H_
#include "UhfRfidFormat.h"
#include "UhfRfidDriver.h"


class UhfRfidNotifyPollingParser
{
public:
    UhfRfidNotifyPollingParser(UhfRfidFrame *frame);
    uint8_t getRSSI();
    UhfRfidPCConvert getPC();
    uint8_t *getEPC();
    uint16_t getCRC();

private:
    UhfRfidFrame *_Frame;
};


#endif /* __UHF_RFID_PAESER_H_ */

