#ifndef _INCLUDED_UNIT_RFID2
#define _INCLUDED_UNIT_RFID2
#include "UnitRfid2Define.h"
#include "SysI2CUtil.h"


class UnitRfid2Driver
{
public:
    UnitRfid2Driver(uint8_t argChipAddress);

    void init();
    bool reset(int timeout);
    void antennaOn();
    void antennaOff();

private:
    SysI2CUtil _I2C;
    uint8_t _ChipAddress = 0;
};


#endif // _INCLUDED_UNIT_RFID2
