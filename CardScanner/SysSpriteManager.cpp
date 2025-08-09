#include "SysDisplay.h"
#include "SysSpriteManager.h"


/// @brief 
SysSpriteManager::SysSpriteManager()
{
}


/// @brief スプライト生成
/// @param width 
/// @param height 
/// @return スプライトの描画オブジェクト
SysSprite *SysSpriteManager::createSprite(int width, int height)
{
    return SysDisplay::getInstance().createSprite(width, height);
}


/// @brief ゲージ生成
/// @param width 
/// @param height 
/// @param current_value 
/// @param max_value 
/// @return ゲージの描画オブジェクト
SysGuiGauge *SysSpriteManager::createGauge(int width, int height, int current_value, int max_value)
{
    auto sprite = createSprite(width, height);
    auto gauge = new SysGuiGauge(sprite, current_value, max_value, width, height);
    return gauge;
}


/// @brief ボタン生成
/// @param width 
/// @param height 
/// @param label 
/// @return ボタンのオブジェクト
SysGuiButton *SysSpriteManager::createButton(int width, int height, const char *label)
{
    auto sprite = createSprite(width, height);
    auto button = new SysGuiButton(sprite, width, height);
    button->setLabel(label);
    return button;
}
