#include "SysDisplay.h"


/// @brief コンストラクタ
SysDisplay::SysDisplay()
{
}


/// @brief 初期化
void SysDisplay::init()
{
    Display.begin();
    Display.fillScreen(TFT_BLACK);
}


/// @brief スプライト生成
/// @param width 
/// @param height 
/// @return 
SysSprite *SysDisplay::createSprite(int width, int height)
{
    auto device_sprite = new LGFX_Sprite( &Display );
    device_sprite->setPsram(true);
    device_sprite->createSprite(width, height);
    device_sprite->setColorDepth( Display.getColorDepth() );
    auto sprite = new SysSprite(device_sprite);
    return sprite;
}
