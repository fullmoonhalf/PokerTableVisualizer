#include "SysSprite.h"


/// @brief コンストラクタ
/// @param argSprite 
SysSprite::SysSprite(LGFX_Sprite *argSprite)
    : _Sprite(argSprite)
{
}


/// @brief デストラクタ
SysSprite::~SysSprite()
{
    _Sprite->deleteSprite();
}

/// @brief 描画
/// @param x 
/// @param y 
void SysSprite::draw(int x, int y)
{
    _Sprite->pushSprite(x, y);
}


/// @brief 四角形描画
/// @param x 
/// @param y 
/// @param w 
/// @param h 
/// @param color 
void SysSprite::drawRect(int x, int y, int w, int h, int color)
{
    _Sprite->drawRect(x, y, w, h, color);
}


/// @brief 四角形描画(塗り潰し)
/// @param x 
/// @param y 
/// @param w 
/// @param h 
/// @param color 
void SysSprite::fillRect(int x, int y, int w, int h, int color)
{
    _Sprite->fillRect(x, y, w, h, color);
}


/// @brief 
/// @param x 
/// @param y 
/// @param text 
void SysSprite::drawText(int x, int y, const char *text)
{
    _Sprite->drawString(text, x, y);
}