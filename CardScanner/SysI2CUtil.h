#ifndef _INCLUDED_SYS_I2C_UTIL_H
#define _INCLUDED_SYS_I2C_UTIL_H
#include <M5Unified.h>



class SysI2CUtil
{
public:
    int readRegister(uint8_t inAddress, uint8_t inRegister, uint8_t *outBuffer, uint8_t inLength);
    int writeRegister(uint8_t inAddress, uint8_t inRegister, uint8_t *inSource, uint8_t inLength);
    int writeRegister(uint8_t inAddress, uint8_t inRegister, uint8_t inSource);
};


#endif // _INCLUDED_SYS_I2C_UTIL_H
