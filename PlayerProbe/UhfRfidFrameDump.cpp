#include "UhfRfidDriver.h"


/// @brief Dump
void UhfRfidFrame::dump(const char *header)
{
    Serial.printf("%s [UhfRfidFrame] Type %02x ", header, type);
    Serial.printf("Command %02x ", command);
    Serial.printf("Param(len=%d) ", length);

    switch(type)
    {
        case UhfRfidFrameType::TypeCommand:
            break;
        case UhfRfidFrameType::TypeResponse:
            switch(command)
            {
                case UhfRfidResponse::UhfRfidResponse_GetTheSelectParameter:
                    {
                        uint8_t sel_param = parameter[0];
                        uint32_t ptr = (parameter[1] << 24) | (parameter[2] << 16) | (parameter[3] << 8) | (parameter[4]);
                        uint8_t mask_len = parameter[5];
                        uint8_t truncate = parameter[6];
                        Serial.printf("SelParam %02X Ptr %04X Truncate %d Mask(len=%d) ", sel_param, ptr, truncate, mask_len);
                        _dump_hex_stream(parameter+7, mask_len, true);
                    }
                    return;
                case UhfRfidResponse::UhfRfidResponse_ReadLabelDataStorageArea:
                    {
                        uint8_t ul = parameter[0];
                        uint8_t epc_length = ul - 2;
                        uint8_t data_length = length - 1 - ul;
                        UhfRfidPCConvert pc = { (parameter[1] << 8) | (parameter[2]) };

                        Serial.printf("pc ");
                        _dump_pc(pc);
                        Serial.printf(" epc ");
                        _dump_hex_stream(parameter+3, epc_length, false);
                        Serial.printf(" data(len=%d) ", data_length);
                        _dump_hex_stream(parameter+1+ul, data_length, true);
                    }
                    return;
                case UhfRfidResponse::UhfRfidResponse_Error:
                    {
                        uint8_t error_code = parameter[0];
                        if((error_code & 0xf0) == UhfRfidErrorType::UhfRfidErrorType_AccessFailReadError)
                        {
                            Serial.printf("Error: AccessFailReadError");
                            _dump_error_code_support(error_code);
                            Serial.println("");
                            return;
                        }
                        switch(error_code)
                        {
                            case UhfRfidErrorType::UhfRfidErrorType_InventoryFail:
                                Serial.println("Error: InventoryFail.");
                                break;
                            case UhfRfidErrorType::UhfRfidErrorType_AccessFail:
                                Serial.println("Error: AccessFail.");
                                break;
                            case UhfRfidErrorType::UhfRfidErrorType_ReadFail:
                                Serial.println("Error: ReadFail.");
                                break;
                            default:
                                Serial.printf("Error: code %02X\r\n", error_code);
                                break;
                        }
                    }
                    return;
            }
            break;
        case UhfRfidFrameType::TypeNotify:
            switch(command)
            {
                case UhfRfidNotify::UhfRfidNotify_Polling:
                    {
                        uint8_t rssi = parameter[0];
                        UhfRfidPCConvert pc = { (parameter[1] << 8) | (parameter[2]) };
                        uint16_t epc_length = pc.format.Length * 2;
                        uint16_t crc_index = 3 + epc_length;
                        uint16_t crc = (parameter[crc_index] << 8) | (parameter[crc_index + 1]);
                        Serial.printf("rssi %d pc ", rssi);
                        _dump_pc(pc);
                        Serial.printf(" crc %04X epc ", crc);
                        _dump_hex_stream(parameter+3, epc_length, true);
                    }
                    return;
            }
            break;
    }

    // どこにもひっかからなかったので、パラメータバイナリを表示する
    _dump_hex_stream(parameter, length, true);
}


void UhfRfidFrame::_dump_hex_stream(uint8_t *argStream, uint16_t argLength, bool newline)
{
    for(uint16_t index=0; index<argLength; ++index)
    {
        Serial.printf("%02x ", argStream[index]);
    }

    if(newline)
    {
        Serial.println(".");
    }
}


void UhfRfidFrame::_dump_error_code_support(uint8_t error_code)
{
    switch(error_code & 0xF)
    {
        case UhfRfidErrorCodeSupport::UhfRfidErrorCodeSupport_MemoryOverrun:
            Serial.printf("(MemoryOverrun)");
            break;
        case UhfRfidErrorCodeSupport::UhfRfidErrorCodeSupport_MemoryLocked:
            Serial.printf("(MemoryLocked)");
            break;
        case UhfRfidErrorCodeSupport::UhfRfidErrorCodeSupport_InsufficientPower:
            Serial.printf("(MemoryOverrun)");
            break;
        case UhfRfidErrorCodeSupport::UhfRfidErrorCodeSupport_NonSpecificError:
            Serial.printf("(NonSpecificError)");
            break;
    }
}


void UhfRfidFrame::_dump_pc(UhfRfidPCConvert &pc)
{
    Serial.printf("%04X(%d,%d,%d,%d,%d)", pc.value, pc.format.Length, pc.format.UMI, pc.format.XPC, pc.format.Toggle, pc.format.RFUorAFI);
}
