#ifndef _INCLUDED_APP_CARD_LISTENER
#define _INCLUDED_APP_CARD_LISTENER
#include <M5Unified.h>


/// @brief カード情報
class AppCardInfo
{
public:
    uint8_t size;
    uint8_t uid[16];
};


/// @brief カードリスナーインターフェイス
class AppCardListener
{
};


#endif // _INCLUDED_APP_CARD_LISTENER
