#include "UhfRfidFrameParser.h"



UhfRfidNotifyPollingParser::UhfRfidNotifyPollingParser(UhfRfidFrame *frame)
{
    _Frame = frame;
}

uint8_t UhfRfidNotifyPollingParser::getRSSI()
{
    return _Frame->parseUint8(0);
}

UhfRfidPCConvert UhfRfidNotifyPollingParser::getPC()
{
    uint16_t value = _Frame->parseUint16(1);
    UhfRfidPCConvert pc = { value };
    return pc;
}

uint8_t *UhfRfidNotifyPollingParser::getEPC()
{
    return _Frame->parseUint8Stream(3);
}

uint16_t UhfRfidNotifyPollingParser::getCRC()
{
    UhfRfidPCConvert pc = getPC();
    uint16_t epc_length = pc.format.Length * 2;
    uint16_t crc_index = 3 + epc_length;
    return _Frame->parseUint16(crc_index);
}
