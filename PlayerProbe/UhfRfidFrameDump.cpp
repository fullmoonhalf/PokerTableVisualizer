#include "UhfRfidDriver.h"
#include "UhfRfidFrameParser.h"


/// @brief Dump
void UhfRfidFrame::dump(const char *header)
{
    Serial.printf("%s [UhfRfidFrame] Type %02x ", header, type);
    Serial.printf("Command %02x ", command);
    Serial.printf("Param(len=%d) ", length);

    switch(type)
    {
        case UhfRfidFrameType::TypeCommand:
            switch(command)
            {
                case UhfRfidCommand_SetTheSelectParameterInstruction:
                    {
                        UhfRfidSelectSelParamConvert selparam = { parameter[0], };
                        uint32_t pointer = _parseUint32(parameter + 1);
                        uint8_t masklen = parameter[5];
                        uint8_t truncate = parameter[6];
                        Serial.printf("SelParam(%d,%d,%d) pointer=%d masklen=%d truncate %d mask:", selparam.format.Target, selparam.format.Action, selparam.format.MemBank, pointer, masklen, truncate);
                        _dump_hex_stream(parameter+7, masklen/8, true);
                    }
                    return;
                case UhfRfidCommand::UhfRfidCommand_WriteTheLabelDataStore:
                    {
                        uint32_t password = _parseUint32(parameter);
                        uint8_t membank = parameter[4];
                        uint16_t sa = _parseUint16(parameter + 5);
                        uint16_t dl = _parseUint16(parameter + 7);
                        Serial.printf("password=%08x membank=%d sa=%d dl=%d ", password, membank, sa, dl);
                        _dump_hex_stream(parameter+9, dl*2, true);
                    }
                    return;
            }
            break;
        case UhfRfidFrameType::TypeResponse:
            switch(command)
            {
                case UhfRfidResponse::UhfRfidResponse_GetTheSelectParameter:
                    {
                        UhfRfidSelectSelParamConvert selparam = { parameter[0], };
                        uint32_t ptr = _parseUint32(parameter + 1);
                        uint8_t mask_len = parameter[5];
                        uint8_t truncate = parameter[6];
                        Serial.printf("SelParam(%d,%d,%d) Ptr %04X Truncate %d Mask(len=%d) ", selparam.format.Target, selparam.format.Action, selparam.format.MemBank, ptr, truncate, mask_len);
                        _dump_hex_stream(parameter+7, mask_len/8, true);
                    }
                    return;
                case UhfRfidResponse::UhfRfidResponse_ReadLabelDataStorageArea:
                    {
                        uint8_t ul = parameter[0];
                        uint8_t epc_length = ul - 2;
                        uint8_t data_length = length - 1 - ul;
                        UhfRfidPCConvert pc = { _parseUint16(parameter + 1) };

                        Serial.printf("pc ");
                        _dump_pc(pc);
                        Serial.printf(" epc ");
                        _dump_hex_stream(parameter+3, epc_length, false);
                        Serial.printf(" data(len=%d) ", data_length);
                        _dump_hex_stream(parameter+1+ul, data_length, true);
                    }
                    return;
                case UhfRfidResponse::UhfRfidResponse_GetParametersRelatedToTheQueryCommand:
                    {
                        UhfRfidQueryParamConvert param =  { _parseUint16(parameter) };
                        Serial.printf("param ");
                        _dump_query_param(param);
                        Serial.println("");
                    }
                    return;
                case UhfRfidResponse::UhfRfidResponse_SetTheQueryParameter:
                    {
                        uint8_t param = parameter[0];
                        Serial.printf("param %02X\r\n", param);
                    }
                    return;
                case UhfRfidResponse::UhfRfidResponse_Error:
                    {
                        uint8_t error_code = parameter[0];
                        if((error_code & 0xf0) == UhfRfidErrorType::UhfRfidErrorType_ReadError)
                        {
                            Serial.printf("Error: ReadError");
                            _dump_error_code_support(error_code);
                            Serial.println("");
                            return;
                        }
                        else if((error_code & 0xf0) == UhfRfidErrorType::UhfRfidErrorType_WriteError)
                        {
                            Serial.printf("Error: WriteError");
                            _dump_error_code_support(error_code);
                            Serial.println("");
                            return;
                        }
                        else if((error_code & 0xf0) == UhfRfidErrorType::UhfRfidErrorType_LockError)
                        {
                            Serial.printf("Error: LockError");
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
                            case UhfRfidErrorType::UhfRfidErrorType_LockFail:
                                Serial.println("Error: LockFail.");
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
                        UhfRfidNotifyPollingParser parser(this);
                        uint8_t rssi = parser.getRSSI();
                        UhfRfidPCConvert pc = parser.getPC();
                        uint16_t crc = parser.getCRC();
                        uint8_t *epc = parser.getEPC();

                        Serial.printf("rssi %d pc ", rssi);
                        _dump_pc(pc);
                        Serial.printf(" crc %04X epc ", crc);
                        _dump_hex_stream(epc, pc.format.Length * 2, true);
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


void UhfRfidFrame::_dump_query_param(UhfRfidQueryParamConvert &param)
{
    Serial.printf("%02X(%d,%d,%d,%d,%d,%d,%d)", param.value, param.format.DR, param.format.M, param.format.TRext, param.format.Sel, param.format.Session, param.format.Target, param.format.Q);
}



uint8_t UhfRfidFrame::parseUint8(int index)
{
    return parameter[index];
}


uint8_t *UhfRfidFrame::parseUint8Stream(int index)
{
    return parameter + index;
}


uint16_t UhfRfidFrame::parseUint16(int index)
{
    return _parseUint16(parameter + index);
}


uint32_t UhfRfidFrame::parseUint32(int index)
{
    return _parseUint32(parameter + index);
}


/// @brief uint8_t の配列から uint16 の値を取得する
/// @param stream 入力メモリ
/// @return 解釈値
uint16_t UhfRfidFrame::_parseUint16(uint8_t *stream)
{
    return (stream[0] << 8) | stream[1];
}


/// @brief uint8_t の配列から uint32 の値を取得する
/// @param stream 入力メモリ
/// @return 解釈値
uint32_t UhfRfidFrame::_parseUint32(uint8_t *stream)
{
    return (stream[0] << 24) | (stream[1] << 16) | (stream[2] << 8) | stream[3];
}
