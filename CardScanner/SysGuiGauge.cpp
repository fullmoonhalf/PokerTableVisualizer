#include "SysSpriteManager.h"
#include "SysGuiGauge.h"    


/// @brief コンストラクタ
/// @param display 
/// @param current_value 
/// @param max_value 
/// @param width 
/// @param height 
SysGuiGauge::SysGuiGauge(SysSprite *argSprite, int current_value, int max_value, int width, int height)
    : _Sprite(argSprite)
    , _CurrentValue(current_value)
    , _MaxValue(max_value)
    , _Width(width)
    , _Height(height)
    , _NeedToUpdate(true)
{
}


/// @brief デストラクタ
SysGuiGauge::~SysGuiGauge()
{
    SysSpriteManager::getInstance().destroySprite(_Sprite);
}


/// @brief 更新処理
void SysGuiGauge::update()
{
    if(_NeedToUpdate == false)
    {
        return;
    }

    _NeedToUpdate = false;

    _Sprite->fillRect(0, 0, _Width, _Height, TFT_BLACK);

    int bar_width = (_CurrentValue * _Width) / _MaxValue;
    if(bar_width > _Width)
    {
        bar_width = _Width;
    }
    if(bar_width > 0)
    {
        _Sprite->fillRect(0, 0, bar_width, _Height, TFT_LIGHTGREY);
    }

    _Sprite->drawRect(0, 0, _Width, _Height, TFT_WHITE);

}


/// @brief 描画処理
/// @param x 
/// @param y 
void SysGuiGauge::draw(int x, int y)
{
    _Sprite->draw(x, y);
}


/// @brief 現在値を設定する
/// @param current_value 
void SysGuiGauge::setCurrentValue(int current_value)
{
    if(_CurrentValue != current_value)
    {
        _NeedToUpdate = true;
    }
    _CurrentValue = current_value;
}
