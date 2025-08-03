#ifndef _INCLUDED_SYS_I2C_UTIL_H
#define _INCLUDED_SYS_I2C_UTIL_H
#include <Wire.h>


class SysI2CUtil
{
public:
    int readRegister(int inAddress, int inRegister, uint8_t *outBuffer, int inLength);
    int writeRegister(int inAddress, int inRegister, uint8_t *inSource, int inLength);
};


#endif // _INCLUDED_SYS_I2C_UTIL_H
