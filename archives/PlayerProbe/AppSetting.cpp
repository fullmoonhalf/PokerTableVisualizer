#include "AppSetting.h"
#include "SysUtils.h"

static uint8_t code[] = {
    // maker code.
    0x30, 0x08, 0x33, 0xb2, 0xdd, 0xd9, 0x01, 0x40, 
};


bool AppEPCCheck(const uint8_t *buffer)
{
    for(int index=0; index<__ARRAY_SIZE__(code); ++index)
    {
        if(code[index] != buffer[index])
        {
            return false;
        }
    }
    return true;
}


int AppEPCWrite(uint8_t *buffer)
{
    for(int index=0; index<__ARRAY_SIZE__(code); ++index)
    {
        buffer[index] = code[index];
    }
    return __ARRAY_SIZE__(code);
}
