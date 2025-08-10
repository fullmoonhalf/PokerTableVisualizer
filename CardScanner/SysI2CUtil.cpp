#define VERBOSE_LEVEL_INFO (1)
#define VERBOSE_LEVEL_DETAIL (2)
#define VERBOSE (VERBOSE_LEVEL_INFO)
#include <Wire.h>
#include "SysI2CUtil.h"
#include "SysLog.h"


/// @brief レジスタから値を読み取る
/// @param inAddress デバイスのアドレス
/// @param inRegister 読み出し先のレジスタ
/// @param outBuffer 保存場所
/// @param inLength 最大読み込み長
/// @return 実読み込み長
int SysI2CUtil::readRegister(uint8_t inAddress, uint8_t inRegister, uint8_t *outBuffer, uint8_t inLength)
{
#if VERBOSE >= VERBOSE_LEVEL_INFO
    SysLog::printf(__NAMEOF__(SysI2CUtil), "readRegister(%d, %d, %p, %d)", inAddress, inRegister, outBuffer, inLength);
#endif

    Wire.beginTransmission(inAddress);
    Wire.write(inRegister);
    uint8_t result = Wire.endTransmission();
    if(result != 0)
    {
#if VERBOSE >= VERBOSE_LEVEL_INFO
        // rc: 0=成功, 1=バッファ超過, 2=アドレスNACK, 3=データNACK, 4=その他エラー    
        SysLog::printf(__NAMEOF__(SysI2CUtil), "readRegister request error %d", result);
#endif
        return 0;
    }

    int index = 0;  // Index in values array.
    uint8_t read_bytes = Wire.requestFrom(inAddress, inLength);
#if VERBOSE >= VERBOSE_LEVEL_DETAIL
    SysLog::printf(__NAMEOF__(SysI2CUtil), "readRegister requestFrom(%d, %d) = %d", inAddress, inLength, read_bytes);
#endif
    while(index < inLength)
    {
        if(Wire.available() > 0)
        {
            outBuffer[index] = Wire.read();
        }
        else
        {
            break;
        }
        ++index;
    }

#if VERBOSE >= VERBOSE_LEVEL_DETAIL
    SysLog::printf(__NAMEOF__(SysI2CUtil), "read %d bytes.", index);
    for(int i=0; i<index; ++i)
    {
        SysLog::printf(__NAMEOF__(SysI2CUtil), "outBuffer[%d] = %02x", i, outBuffer[i]);
    }
#endif
    return index;
}


/// @brief レジスタに値を書き込む
/// @param inAddress デバイスのアドレス
/// @param inRegister 書き込み先のレジスタ
/// @param inSource 書き込みするデータ
/// @param inLength 書き込みするデータの長さ
/// @return 実書き込み長
int SysI2CUtil::writeRegister(uint8_t inAddress, uint8_t inRegister, uint8_t *inSource, uint8_t inLength)
{
#if VERBOSE >= VERBOSE_LEVEL_INFO
    SysLog::printf(__NAMEOF__(SysI2CUtil), "writeRegister(%d, %d, %p, %d)", inAddress, inRegister, inSource, inLength);
#endif

    Wire.beginTransmission(inAddress);
    Wire.write(inRegister);
    for (int index = 0; index < inLength; index++) 
    {
        Wire.write(inSource[index]);
    }
    Wire.endTransmission();

    return inLength;
}


/// @brief レジスタに 1 byte だけ値を書き込む
/// @param inAddress 
/// @param inRegister 
/// @param inSource 
/// @return 
int SysI2CUtil::writeRegister(uint8_t inAddress, uint8_t inRegister, uint8_t inSource)
{
#if VERBOSE >= VERBOSE_LEVEL_INFO
    SysLog::printf(__NAMEOF__(SysI2CUtil), "writeRegister(%d, %d, %02X)", inAddress, inRegister, inSource);
#endif
    Wire.beginTransmission(inAddress);
    Wire.write(inRegister);
    Wire.write(inSource);
    Wire.endTransmission();

    return 1;
}
