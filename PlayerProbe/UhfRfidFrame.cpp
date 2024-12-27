#include "UhfRfidDriver.h"
#include "UhfRfidFormat.h"


/// @brief 
/// @param param_buffer_size 
void UhfRfidFrame::init(int parameter_buffer_size)
{
    parameter = new uint8_t[parameter_buffer_size];
    _wait_chunk = UhfRfidChunk::ChunkHeader;
    _chunk_index = 0;
}


/// @brief 
/// @param value 
/// @return 正常に読み終わればtrue。
bool UhfRfidFrame::read(uint8_t value)
{
    bool end = false;

    switch(_wait_chunk)
    {
        case UhfRfidChunk::ChunkInvalid:
        case UhfRfidChunk::ChunkHeader:
            if(value == HEADER_MAGIC_NUMBER)
            {
                _wait_chunk = UhfRfidChunk::ChunkType;
            }
            else
            {
                _wait_chunk = UhfRfidChunk::ChunkInvalid;
            }
            break;
        case UhfRfidChunk::ChunkType:
            switch(value)
            {
                case UhfRfidFrameType::TypeCommand:
                case UhfRfidFrameType::TypeNotify:
                case UhfRfidFrameType::TypeResponse:
                    type = value;
                    _wait_chunk = UhfRfidChunk::ChunkCommand;
                    break;
                default:
                    _wait_chunk = UhfRfidChunk::ChunkInvalid;
                    break;
            }
            break;
        case UhfRfidChunk::ChunkCommand:
            {
                command = value;
                length = 0;
                _wait_chunk = UhfRfidChunk::ChunkLength;
                _chunk_index = 0;
            }
            break;
        case UhfRfidChunk::ChunkLength:
            {
                length = (length << 8) + value;
                _chunk_index++;
                if(_chunk_index >= 2)
                {
                    if(length > 0)
                    {
                        _wait_chunk = UhfRfidChunk::ChunkParameter;
                        _chunk_index = 0;
                    }
                    else
                    {
                        _wait_chunk = UhfRfidChunk::ChunkChecksum;
                    }
                }
            }
            break;
        case UhfRfidChunk::ChunkParameter:
            {
                parameter[_chunk_index] = value;
                _chunk_index++;
                if(_chunk_index >= length)
                {
                    _wait_chunk = UhfRfidChunk::ChunkChecksum;
                }
            }
            break;
        case UhfRfidChunk::ChunkChecksum:
            {
                uint8_t checksum = calcurateChecksum();
                if(checksum == value)
                {
                    _wait_chunk = UhfRfidChunk::ChunkFooter;
                }
                else
                {
                    _wait_chunk = UhfRfidChunk::ChunkInvalid;
                }
            }
            break;
        case UhfRfidChunk::ChunkFooter:
            {
                if(value == FOOTER_MAGIC_NUMBER)
                {
                    end = true;
                    _wait_chunk = UhfRfidChunk::ChunkHeader;
                }
                else
                {
                    _wait_chunk = UhfRfidChunk::ChunkInvalid;
                }
            }
            break;
    }

    return end;
}


/// @brief エンコード
/// @param output 
/// @param capacity
/// @return エンコード長
int UhfRfidFrame::encode(uint8_t *output, int capacity)
{
    // header
    uint8_t *seek = output;
    *seek = HEADER_MAGIC_NUMBER;
    seek++;

    // type
    *seek = type;
    seek++;

    // command
    *seek = command;
    seek++;

    // param length
    seek[0] = (length >> 8) & 0xff;
    seek[1] = length & 0xff;
    seek += 2;

    // parameter
    for(int index=0; index<length; ++index)
    {
        seek[index] = parameter[index];
    }
    seek += length;

    // calcurate checksum
    *seek = calcurateChecksum();
    seek++;

    // footer
    *seek = FOOTER_MAGIC_NUMBER;
    seek++;

    return seek - output;
}


/// @brief 
/// @return 
uint8_t UhfRfidFrame::calcurateChecksum()
{
    uint8_t checksum = 0;
    checksum += type;
    checksum += command;
    checksum += (length >> 8) & 0xff;
    checksum += length & 0xff;
    for(int index=0; index<length; ++index)
    {
        checksum += parameter[index];
    }
    return checksum;
}


/// @brief セットアップ
/// @param command 
/// @param param 
/// @param length 
/// @return 
bool UhfRfidFrame::setup(uint8_t argType, uint8_t argCommand, uint8_t *argParam, uint16_t argLength)
{
    type = argType;
    command = argCommand;
    length = argLength;
    for(int index=0; index<length; ++index)
    {
        parameter[index] = argParam[index];
    }
    return true;
}
