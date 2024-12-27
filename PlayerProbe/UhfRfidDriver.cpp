#include "UhfRfidDriver.h"

static const uint16_t SEND_BUFFER_LENGTH = 128;
static const uint16_t READ_BUFFER_LENGTH = 128;
static const int READ_BUFFER_COLLECTION_CAPACITY = 512;
static const int SEND_BUFFER_COLLECTION_CAPACITY = 32;


/// @brief コンストラクタ
UhfRfidDriver::UhfRfidDriver()
    : _verbose(false)
    , _update_count(0)
{

}


/// @brief 詳細デバッグモードの設定
/// @param sw 
void UhfRfidDriver::setVerbose(bool sw)
{
    _verbose = sw;
}


/// @brief 更新カウントの取得
int UhfRfidDriver::getUpdateCount()
{
    return _update_count;
}


/// @brief 処理開始
void UhfRfidDriver::begin(HardwareSerial *serial, int baud, uint8_t RX, uint8_t TX)
{
    // バッファの準備
    _ReadFramePool = new UhfRfidFramePool(READ_BUFFER_COLLECTION_CAPACITY, READ_BUFFER_LENGTH);
    _SendFramePool = new UhfRfidFramePool(SEND_BUFFER_COLLECTION_CAPACITY, SEND_BUFFER_LENGTH);
    _SendFrameImmidiate.init(SEND_BUFFER_LENGTH);

    // シリアルコンテキスト初期化
    _serial = serial;
    _serial->begin(baud, SERIAL_8N1, RX, TX);
}


/// @brief プロセス
/// 別スレッドで回すこと。
void UhfRfidDriver::process()
{
    UhfRfidFrame *current_read_buffer = _ReadFramePool->use();

    for(;;_update_count++)
    {
        // データ送信の対応
        while(UhfRfidFrame *send_frame = _SendFramePool->process())
        {
            _send_immidiately(send_frame);
        }

        // read 側の処理
        while(_serial->available())
        {
            uint8_t value = _serial->read();
            bool frame_end = current_read_buffer->read(value);
            if(frame_end)
            {
                _ReadFramePool->fix();
                current_read_buffer = _ReadFramePool->use();
            }
        }

        // 読んだデータの処理
        while(UhfRfidFrame *read_frame = _ReadFramePool->process())
        {
            if(_verbose)
            {
                read_frame->dump("[UhfRfidDriver::process recv]");
            }
        }

        // ちょいまち
        delay(50);
    }
}

/// @brief 処理終了
void UhfRfidDriver::end()
{
}


/// @brief 即座受信
/// @param read_buffer 
/// @return 
bool UhfRfidDriver::_read_immidiately(UhfRfidFrame *read_buffer)
{
    while(_serial->available())
    {
        uint8_t value = _serial->read();
        bool frame_end = read_buffer->read(value);
        if(frame_end)
        {
            return true;
        }
    }
    return false;
}



/// @brief 即座送信
/// @param send_buffer 
/// @return 
bool UhfRfidDriver::_send_immidiately(UhfRfidFrame *send_frame)
{
    int encode_length = send_frame->encode(_send_buffer, 256);
    _serial->write(_send_buffer, encode_length);
    if(_verbose)
    {
        send_frame->dump("[UhfRfidDriver::_send_immidiately]");
    }

    return true;
}


/// @brief 即座送信
/// @param command 
/// @param param 
/// @param length 
/// @return 
bool UhfRfidDriver::_send_immidiately(uint8_t command, uint8_t *param, uint16_t length)
{
    UhfRfidFrame *frame = &_SendFrameImmidiate;
    if(frame->setup(UhfRfidFrameType::TypeCommand, command, param, length))
    {
        if(_send_immidiately(frame))
        {
            return true;
        }
    }
    return false;
}


/// @brief コマンドを送信キューに乗せる
/// @param command 
/// @param param 
/// @param length 
/// @return 
bool UhfRfidDriver::_send_enqueue(uint8_t command, uint8_t *param, uint16_t length)
{
    // Frame の形にする
    UhfRfidFrame *frame = _SendFramePool->use();
    frame->setup(UhfRfidFrameType::TypeCommand, command, param, length);
    _SendFramePool->fix();

    return true;
}


/// @brief 送信
/// @param command 
/// @param param 
/// @param length 
/// @param immidiately 
/// @return 
bool UhfRfidDriver::_send(uint8_t command, uint8_t *param, uint16_t length, bool immidiately)
{
    if(immidiately)
    {
        return _send_immidiately(command, param, length);
    }
    else
    {
        return _send_enqueue(command, param, length);
    }
}
