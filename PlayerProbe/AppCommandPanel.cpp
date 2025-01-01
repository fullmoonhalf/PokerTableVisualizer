#include <M5Unified.h>
#include "AppCommandPanel.h"



static const int WIDTH = 70;
static const int HEIGHT = 60;
static const int COL_MAX = 4;
static const int OFFSET_X = 20;
static const int OFFSET_Y = 40;



/// @brief コンストラクタ
AppCommandPanel::AppCommandPanel(AppDisplay *display)
{
    _Display = display;
    _Width = WIDTH;
    _Height = HEIGHT;
    _ColNumPerLine = COL_MAX;
    _OffsetX = OFFSET_X;
    _OffsetY = OFFSET_Y;
    resetSelected();
}


/// @brief 
/// @param name 
/// @param func 
void AppCommandPanel::regist(AppCommand *command)
{
    // コマンド登録
    _Command_Collection[_Command_Count] = command;

    // スプライト生成
    auto sprite = new LGFX_Sprite( &_Display->Display );
    _Sprites_Collection[_Command_Count] = sprite;
    sprite->createSprite(_Width, _Height);
    sprite->setColorDepth( _Display->Display.getColorDepth() );
    sprite->setFont(&fonts::Font2);

    _Command_Count++;
}


/// @brief 更新処理
/// @param touchX 
/// @param touchY 
void AppCommandPanel::update(int touchX, int touchY)
{
    int current_selected_index = calcSelectedIndex(touchX, touchY);
    if(_SelectedIndex != current_selected_index)
    {
        _RenewToDraw = true;
        _SelectedIndex = current_selected_index;
    }
}


/// @brief 何を選択されているのかを計算する。
/// @param touchX 
/// @param touchY 
/// @return 
int AppCommandPanel::calcSelectedIndex(int touchX, int touchY)
{
    if(touchX < 0 || touchY < 0)
    {
        return -1;
    }

    int touch_x_index = (touchX - _OffsetX) / _Width;
    if(touch_x_index < 0 || touch_x_index >= _ColNumPerLine)
    {
        return -1;
    }

    int touch_y_index = (touchY - _OffsetY) / _Height;
    if(touch_y_index < 0)
    {
        return -1;
    }

    int touch_index = touch_x_index + touch_y_index * _ColNumPerLine;
    if(touch_index >= _Command_Count)
    {
        return -1;
    }

    return touch_index;
}


/// @brief 
void AppCommandPanel::draw()
{
    for(int index=0; index<_Command_Count; ++index)
    {
        auto sprite = _Sprites_Collection[index];
        int x = (index % _ColNumPerLine) * _Width + _OffsetX;
        int y = (index / _ColNumPerLine) * _Height + _OffsetY;

        // 内容の更新
        if(_RenewToDraw)
        {
            if(index == _SelectedIndex)
            {
                sprite->fillRect(0, 0, _Width, _Height, TFT_DARKCYAN);
            }
            else
            {
                sprite->fillRect(0, 0, _Width, _Height, TFT_BLACK);
                sprite->drawRect(0, 0, _Width, _Height, TFT_WHITE);
            }
            sprite->drawString(_Command_Collection[index]->name, 3, 20);
        }

        // 描画
        sprite->pushSprite(x, y);
    }

    _RenewToDraw = false;
}


/// @brief 選択されているコマンドを取得する
/// @return 選択されているコマンド。ない場合は nullptr
AppCommand *AppCommandPanel::getSelected()
{
    if(_SelectedIndex >= 0 && _SelectedIndex < _Command_Count)
    {
        return _Command_Collection[_SelectedIndex];
    }
    return nullptr;
}


/// @brief 選択解除する
void AppCommandPanel::resetSelected()
{
    _SelectedIndex = -1;
    _RenewToDraw = true;
}

