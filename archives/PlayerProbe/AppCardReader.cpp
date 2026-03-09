#include "UhfRfidFrameParser.h"
#include "AppCardReader.h"
#include "SysUtils.h"


/// @brief コンストラクタ
AppCardReader::AppCardReader()
    : _StatusUpdated(true)
    , _LastDrawCount(0)
{
    reset();
}


void AppCardReader::reset()
{
    _StatusUpdated = true;
    for(int index=0; index<__ARRAY_SIZE__(_RecognizedCards); ++index)
    {
        _RecognizedCards[index] = false;
    }

}


void AppCardReader::flushSource()
{
    reset();
}


/// @brief 
/// @param card_index 
void AppCardReader::recognize(int card_index)
{
    if(card_index >= 0 && card_index < __ARRAY_SIZE__(_RecognizedCards))
    {
        if(_RecognizedCards[card_index] != true)
        {
            _StatusUpdated = true;
        }
        _RecognizedCards[card_index] = true;
    }

}


/// @brief 
/// @param sprites 
void AppCardReader::draw(AppPlaycardSprites *sprites)
{
    const int baseX = 20;
    const int baseY = 165;
    const int colnum = 16;

    int draw_count = 0;
    for(int index=1; index<__ARRAY_SIZE__(_RecognizedCards); ++index)
    {
        if(_RecognizedCards[index])
        {
            int drawX = baseX + (draw_count % colnum) * 18;
            int drawY = baseY + (draw_count / colnum) * 35;
            sprites->draw(index, drawX, drawY);
            ++draw_count;
        }
    }

    for(int blank = draw_count; blank < _LastDrawCount; ++blank)
    {
        int drawX = baseX + (blank % colnum) * 18;
        int drawY = baseY + (blank / colnum) * 35;
        sprites->draw(0, drawX, drawY);
    }

    _LastDrawCount = draw_count;
}


/// @brief 
/// @param frame 
void AppCardReader::onReceive(UhfRfidFrame *frame)
{
    switch(frame->type)
    {
        case UhfRfidFrameType::TypeNotify:
            switch(frame->command)
            {
                case UhfRfidNotify::UhfRfidNotify_Polling:
                    {
                        UhfRfidNotifyPollingParser parser(frame);
                        uint8_t *epc = parser.getEPC();
                        uint8_t card_index = epc[11];
                        recognize(card_index);
                    }
                    return;
            }
            break;
    }
}


/// @brief ステータス取得する
/// @param buffer 
/// @return 
int AppCardReader::tryGetStatus(char *buffer)
{
    if(_StatusUpdated == false)
    {
        return 0;
    }

    char *seek = buffer;
    seek += sprintf(seek, "cards:");
    const char *delim = "";
    for(int index=1; index<__ARRAY_SIZE__(_RecognizedCards); ++index)
    {
        if(_RecognizedCards[index])
        {
            seek += sprintf(seek, "%s%d", delim, index);
            delim = ",";
        }
    }

    _StatusUpdated = false;
    return seek - buffer;
}
