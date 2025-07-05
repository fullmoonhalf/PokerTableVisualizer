#include "SysSpriteManager.h"


/// @brief 
SysSpriteManager::SysSpriteManager()
{
}


/// @brief ディスプレイとの紐付け
/// @param argDisplay 
void SysSpriteManager::bind(SysDisplay *argDisplay)
{
    _Display = argDisplay;
}


/// @brief スプライト生成
/// @param width 
/// @param height 
/// @return スプライトの描画オブジェクト
SysSprite *SysSpriteManager::createSprite(int width, int height)
{
    return _Display->createSprite(width, height);
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
