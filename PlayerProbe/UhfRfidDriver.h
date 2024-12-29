#ifndef __UHF_RFID_DRIVER_H_
#define __UHF_RFID_DRIVER_H_
#include <Arduino.h>
#include "UhfRfidFormat.h"


#define __DUMP_FL__ Serial.printf("<%s:%d>\r\n", __FILE__, __LINE__);
#define __ARRAY_SIZE__(x)  (sizeof((x))/sizeof((x)[0]))

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
    void _dump_error_code_support(uint8_t error_code);
    void _dump_pc(UhfRfidPCConvert &pc);
    void _dump_query_param(UhfRfidQueryParamConvert &param);
    uint32_t _parseUint32(uint8_t *stream);
    uint16_t _parseUint16(uint8_t *stream);

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

    bool resetInventoryParam();

    /* セットアップ系 */
    bool commandTxPower(uint16_t power, bool immidiately = false);

    /* Query まわり */
    bool commandSetTheQueryParameter(UhfRfidQueryParamDRType dr, UhfRfidQueryParamMType m, UhfRfidQueryParamTRextType trext,  UhfRfidQueryParamSelType sel, UhfRfidQueryParamSessionType session, UhfRfidQueryParamTargetType target, uint8_t q, bool immidiately = false);

    /* Select まわり */
    bool commandSetTheSelectParameterInstruction(UhfRfidSelectSelParamTarget target, UhfRfidSelectSelParamAction action, UhfRfidSelectSelParamMembank membank, uint32_t pointer, uint8_t length, uint8_t *mask, bool truncate, bool immidiately = false);
    bool commandSetTheSelectMode(UhfRfidSelectMode mode, bool immidiately = false);

    /* Polling まわり */
    bool commandSinglePollingInstruction(bool immidiately = false);
    bool commandMultiPollingInstruction(uint16_t count, bool immidiately = false);

    /* タグ操作系 */
    bool commandReadLabelDataStorageArea(uint32_t access_password, UhfRfidSelectSelParamMembank membank, uint16_t sa, uint16_t dl, bool immidiately = false);
    bool commandWriteTheLabelDataStore(uint32_t access_password, UhfRfidSelectSelParamMembank membank, uint8_t *stream, int length, uint16_t sa, bool immidiately = false);

    /* 状態取得系 */
    bool commandInformation(UhfRfidInformationType what, bool immidiately = false);
    bool commandGetParametersRelatedToTheQueryCommand(bool immidiately = false);
    bool commandGetTheSelectParameter(bool immidiately = false);


private:
    bool _read_immidiately(UhfRfidFrame *read_buffer);

    bool _send_immidiately(UhfRfidFrame *send_buffer);
    bool _send_immidiately(uint8_t command, uint8_t *param, uint16_t length);
    bool _send_enqueue(uint8_t command, uint8_t *param, uint16_t length);
    bool _send(uint8_t command, uint8_t *param, uint16_t length, bool immidiately);

    int _write_uint32_to_stream(uint8_t *output, uint32_t input);
    int _write_uint16_to_stream(uint8_t *output, uint16_t input);
    int _write_uint8_to_stream(uint8_t *output, uint8_t input);

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

