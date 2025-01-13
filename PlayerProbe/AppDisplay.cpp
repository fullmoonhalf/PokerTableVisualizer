#include "AppDisplay.h"


/// @brief コンストラクタ
AppDisplay::AppDisplay()
{
}


/// @brief 初期化
void AppDisplay::init()
{
    Display.begin();
    Display.fillScreen(TFT_BLACK);
}


/// @brief スプライト生成
/// @param width 
/// @param height 
/// @return 
LGFX_Sprite *AppDisplay::createSprite(int width, int height)
{
    auto sprite = new LGFX_Sprite( &Display );
    sprite->setPsram(true);
    sprite->createSprite(width, height);
    sprite->setColorDepth( Display.getColorDepth() );
    return sprite;
}
