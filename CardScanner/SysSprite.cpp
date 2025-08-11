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
    drawText(x, y, 1.0f, TFT_WHITE, text);
}


/// @brief 
/// @param x 
/// @param y 
/// @param size 
/// @param text 
void SysSprite::drawText(int x, int y, float size, const char *text)
{
    drawText(x, y, size, TFT_WHITE, text);
}


/// @brief 
/// @param x 
/// @param y 
/// @param size 
/// @param color 
/// @param text 
void SysSprite::drawText(int x, int y, float size, uint16_t color, const char *text)
{
    _Sprite->setTextColor(color);
    _Sprite->setTextSize(size);
    _Sprite->drawString(text, x, y);
}


/// @brief 
/// @param x 
/// @param y 
/// @param w 
/// @param h 
/// @param bitmap 
void SysSprite::drawImage(int x, int y, int w, int h, const uint16_t *bitmap)
{
    _Sprite->pushImage(x, y, w, h, bitmap);
}


/// @brief 
void SysSprite::clear()
{
    _Sprite->clear();
}
