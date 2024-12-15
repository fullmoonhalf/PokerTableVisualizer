#ifndef __UHF_RFID_DRIVER_H_
#define __UHF_RFID_DRIVER_H_
#include <Arduino.h>


#define HEADER_MAGIC_NUMBER (0xBB)
#define FOOTER_MAGIC_NUMBER (0x7E)



#define __DUMP_FL__ Serial.printf("<%s:%d>\r\n", __FILE__, __LINE__);


enum UhfRfidFrameType
{
    /// @brief send to M100 chip.
    TypeCommand = 0,
    /// @brief response from M100 chip.
    TypeResponse = 1,
    /// @brief notify from M100 chip.
    /// 1 つのポーリング命令と複数のポーリング命令にも、対応する通知フレームがあります。 
    /// マイコンから送信された通知フレームの数は、読み取り状況に応じて自律的にホストコンピュータに送信されます。 
    /// リーダーがタグを読み取ると通知フレームが送信され、リーダーが複数のタグを読み取ると、複数の通知フレームが送信されます
    TypeNotify = 2,
};


enum UhfRfidChunk
{
    ChunkInvalid,
    ChunkHeader,
    ChunkType,
    ChunkCommand,
    ChunkLength,
    ChunkParameter,
    ChunkChecksum,
    ChunkFooter,
};


enum UhfRfidCommand
{
    UhfRfidCommand_Information = 0x03,
    UhfRfidCommand_GetTheSelectParameter = 0x0B,
    UhfRfidCommand_SetTheSelectParameterInstruction = 0x0C,
    UhfRfidCommand_SinglePollingInstruction = 0x22,
    UhfRfidCommand_MultiPollingInstruction = 0x27,
    UhfRfidCommand_SetTheTransmittingPower = 0xB6,
};


enum UhfRfidResponse
{
    UhfRfidResponse_GetTheSelectParameter = 0x0B,
    UhfRfidResponse_Error = 0xff,
};


enum UhfRfidNotify
{
    UhfRfidNotify_Polling = 0x22,
};


class UhfRfidFrame
{
public:
    void init(int parameter_buffer_size);
    bool read(uint8_t value);
    int encode(uint8_t *output, int capacity);
    uint8_t calcurateChecksum();
    bool setup(uint8_t type, uint8_t command, uint8_t *param, uint16_t length);
    void dump(const char *header);

private:
    void _dump_hex_stream(uint8_t *stream, uint16_t length, bool newline);

public:
    uint8_t type;
    uint8_t command;
    uint16_t length;
    uint8_t *parameter;

private:
    UhfRfidChunk _wait_chunk;
    int _chunk_index;
};


/// @brief 
class UhfRfidFramePool
{
public:
    UhfRfidFramePool(int capacity, int buffer_size);
    UhfRfidFrame *use();
    void fix();
    UhfRfidFrame *process();
    void reset();

private:
    UhfRfidFrame *_Pool;
    int _Capacity;
    int _UseHeadIndex;
    int _UseTailIndex;
    int _UseWriteIndex;
};


/// @brief 
class UhfRfidDriver
{
public:
    UhfRfidDriver();
    void begin(HardwareSerial *serial, int baud, uint8_t RX, uint8_t TX);
    void process();
    void end();

    void setVerbose(bool sw);
    int getUpdateCount();

    bool commandTxPower(uint16_t power, bool immidiately = false);
    bool commandInformation(uint8_t what, bool immidiately = false);
    bool commandSinglePollingInstruction(bool immidiately = false);
    bool commandMultiPollingInstruction(uint16_t count, bool immidiately = false);
    bool commandGetTheSelectParameter(bool immidiately = false);
    bool commandSetTheSelectParameterInstruction(bool immidiately = false);


private:
    bool _read_immidiately(UhfRfidFrame *read_buffer);

    bool _send_immidiately(UhfRfidFrame *send_buffer);
    bool _send_immidiately(uint8_t command, uint8_t *param, uint16_t length);
    bool _send_enqueue(uint8_t command, uint8_t *param, uint16_t length);
    bool _send(uint8_t command, uint8_t *param, uint16_t length, bool immidiately);

private:
    HardwareSerial *_serial;
    UhfRfidFramePool *_ReadFramePool;
    UhfRfidFramePool *_SendFramePool;
    UhfRfidFrame _SendFrameImmidiate;
    uint8_t _send_buffer[256];

    bool _verbose;
    int _update_count;
};


#endif // __UHF_RFID_DRIVER_H_

