#define VERBOSE (1)
#include <M5Unified.h>
#include "SysLog.h"
#include "UnitRfid2Driver.h"


/// @brief コンストラクタ
/// @param argChipAddress 
UnitRfid2Driver::UnitRfid2Driver(uint8_t argChipAddress)
    : _ChipAddress(argChipAddress)
{
}


/// @brief 初期化
void UnitRfid2Driver::init()
{
#if VERBOSE
    SysLog::printf(__NAMEOF__(UnitRfid2Driver), "init");
#endif
    reset(16);

    // When communicating with a PICC we need a timeout if something goes wrong.
    // f_timer = 13.56 MHz / (2*TPreScaler+1) where TPreScaler =
    // [TPrescaler_Hi:TPrescaler_Lo]. TPrescaler_Hi are the four low bits in
    // TModeReg. TPrescaler_Lo is TPrescalerReg.
#if VERBOSE
    SysLog::printf(__NAMEOF__(UnitRfid2Driver), "init - setup registers.");
#endif

    // TAuto=1; timer starts automatically at the end of the
    // transmission in all communication modes at all speeds
    _I2C.writeRegister(_ChipAddress, MFRC522_Register::TModeReg, 0x80);

    // TPreScaler = TModeReg[3..0]:TPrescalerReg, ie 0x0A9 = 169 =>
    // f_timer=40kHz, ie a timer period of 25 .
    _I2C.writeRegister(_ChipAddress, MFRC522_Register::TPrescalerReg, 0xA9);

    // Reload timer with 0x3E8 = 1000, ie 25ms before timeout.
    _I2C.writeRegister(_ChipAddress, MFRC522_Register::TReloadRegH, 0x03);
    _I2C.writeRegister(_ChipAddress, MFRC522_Register::TReloadRegL, 0xE8);

    // Default 0x00. Force a 100 % ASK modulation
    // independent of the ModGsPReg register setting
    _I2C.writeRegister(_ChipAddress, MFRC522_Register::TxASKReg, 0x40);  

    // Default 0x3F. Set the preset value for the CRC coprocessor
    // for the CalcCRC command to 0x6363 (ISO 14443-3 part 6.2.4)
    _I2C.writeRegister(_ChipAddress, MFRC522_Register::ModeReg, 0x3D);

    // アンテナの有効化
    antennaOn();

#if VERBOSE
    SysLog::printf(__NAMEOF__(UnitRfid2Driver), "init - done.");
#endif
}



/// @brief タイムアウト
/// @param timeout 最大何回テストするのか？
/// @return 
bool UnitRfid2Driver::reset(int timeout)
{
#if VERBOSE
    SysLog::printf(__NAMEOF__(UnitRfid2Driver), "reset - start. %p, %p", this, &_I2C);
#endif

    _I2C.writeRegister(_ChipAddress, MFRC522_Register::CommandReg, MFRC522_Command::PCD_SoftReset);
    delay(50);

    for(int count=0; count<timeout; ++count)
    {
        uint8_t value = 0;
        auto length = _I2C.readRegister(_ChipAddress, MFRC522_Register::CommandReg, &value, 1);
        if(length > 0)
        {
            uint8_t power_down_bit = value & (1 << 4);
            if(power_down_bit == 0)
            {
#if VERBOSE
                SysLog::printf(__NAMEOF__(UnitRfid2Driver), "reset - success.");
#endif
                return true;
            }
        }

        delay(50);
    }

#if VERBOSE
    SysLog::printf(__NAMEOF__(UnitRfid2Driver), "reset - failure.");
#endif
    return false;
}


void UnitRfid2Driver::antennaOn()
{
#if VERBOSE
    SysLog::printf(__NAMEOF__(UnitRfid2Driver), "antennaOn");
#endif

    // Enable the antenna driver pins TX1 and TX2 (they were disabled by the reset)
    uint8_t value = 0;
    auto length = _I2C.readRegister(_ChipAddress, MFRC522_Register::TxControlReg, &value, 1);
    if(length <= 0)
    {
        return;
    }

    if ((value & 0x03) != 0x03) 
    {
        _I2C.writeRegister(_ChipAddress, MFRC522_Register::TxControlReg, value | 0x03);
    }
}


void UnitRfid2Driver::antennaOff()
{
}
