#include "SysI2CUtil.h"



/// @brief レジスタから値を読み取る
/// @param inAddress デバイスのアドレス
/// @param inRegister 読み出し先のレジスタ
/// @param outBuffer 保存場所
/// @param inLength 最大読み込み長
/// @return 実読み込み長
int SysI2CUtil::readRegister(int inAddress, int inRegister, uint8_t *outBuffer, int inLength)
{
    Wire.beginTransmission(inAddress);
    Wire.write(inRegister);
    Wire.endTransmission();

    int index = 0;  // Index in values array.
    Wire.requestFrom(inRegister, inLength);
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

    return index;
}


/// @brief レジスタに値を書き込む
/// @param inAddress デバイスのアドレス
/// @param inRegister 書き込み先のレジスタ
/// @param inSource 書き込みするデータ
/// @param inLength 書き込みするデータの長さ
/// @return 実書き込み長
int SysI2CUtil::writeRegister(int inAddress, int inRegister, uint8_t *inSource, int inLength)
{
    Wire.beginTransmission(inAddress);
    Wire.write(inRegister);
    for (int index = 0; index < inLength; index++) 
    {
        Wire.write(inSource[index]);
    }
    Wire.endTransmission();

    return inLength;
}
