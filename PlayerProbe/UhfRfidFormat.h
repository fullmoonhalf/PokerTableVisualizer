#ifndef __UHF_RFID_FORMAT_H_
#define __UHF_RFID_FORMAT_H_
#include <Arduino.h>


/// @brief RFID の PC の内容
/// 参考文献:
/// https://www.mars-tohken.co.jp/techblog/flags-176-ictag/
/// https://www.mars-tohken.co.jp/techblog/flags210-ictag/
/// https://enjoy-rfid.blogspot.com/2016/08/epc.html
struct UhfRfidPCFormat
{
    /// @brief Toggleが0の場合にはすべて0です。1の場合はISO/IEC15962に規定されているAFI値
    uint16_t RFUorAFI:8;
    /// @brief global準拠か、非EPCglobal準拠か
    uint16_t Toggle:1;
    /// @brief 拡張PCの有無
    uint16_t XPC:1;
    /// @brief ank11[USER]メモリの有り/無し
    uint16_t UMI:1;
    /// @brief EPCの長さ。ワード単位(2bytes)で指定
    uint16_t Length:5;
};

union UhfRfidPCConvert
{
    uint16_t value;
    UhfRfidPCFormat format;
};


#endif
