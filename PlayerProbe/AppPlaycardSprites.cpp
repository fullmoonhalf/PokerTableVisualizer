#include "AppPlaycardSprites.h"


/// @brief コンストラクタ
/// @param display 
AppPlaycardSprites::AppPlaycardSprites(AppDisplay *display)
{
    _Display = display;
}


/// @brief 初期化
void AppPlaycardSprites::init()
{
    for(int index=0; index<52; ++index)
    {
        const char *suit_text[] = {"S","H","D","C"};
        const uint16_t suit_color[] ={TFT_WHITE, TFT_RED, TFT_CYAN, TFT_GREEN};
        const char *rank_text[] = {"A","2","3","4","5","6","7","8","9","T","J","Q","K"};

        int suit = index / 13;
        int rank = index % 13;

        auto sprite = new LGFX_Sprite( &_Display->Display );
        _Sprites_Collection[index] = sprite;
        sprite->createSprite(16, 32);
        sprite->setColorDepth( _Display->Display.getColorDepth() );
        sprite->setFont(&fonts::Font2);
        sprite->setTextColor(suit_color[suit]);
        sprite->drawString(suit_text[suit], 5, 1);
        sprite->drawString(rank_text[rank], 5, 15);
        sprite->drawRect(0, 0, 16, 32, suit_color[suit]);
    }
}


/// @brief 描画
/// @param index 
/// @param x 
/// @param y 
void AppPlaycardSprites::draw(int index, int x, int y)
{
    _Sprites_Collection[index]->pushSprite( 20, 165 );
}
