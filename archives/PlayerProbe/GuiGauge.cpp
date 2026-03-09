#include "GuiGauge.h"


/// @brief コンストラクタ
/// @param display 
/// @param current_value 
/// @param max_value 
/// @param width 
/// @param height 
GuiGauge::GuiGauge(M5GFX *display, int current_value, int max_value, int width, int height)
    : _CurrentValue(current_value)
    , _MaxValue(max_value)
    , _Width(width)
    , _Height(height)
    , _NeedToUpdate(true)
{
    _Sprite = new LGFX_Sprite( display );
    _Sprite->createSprite(_Width, _Height);
    _Sprite->setColorDepth( display->getColorDepth() );
}


/// @brief デストラクタ
GuiGauge::~GuiGauge()
{
    delete _Sprite;
}


/// @brief 更新処理
void GuiGauge::update()
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
void GuiGauge::draw(int x, int y)
{
    _Sprite->pushSprite(x, y);
}


/// @brief 現在値を設定する
/// @param current_value 
void GuiGauge::setCurrentValue(int current_value)
{
    if(_CurrentValue != current_value)
    {
        _NeedToUpdate = true;
    }
    _CurrentValue = current_value;
}
