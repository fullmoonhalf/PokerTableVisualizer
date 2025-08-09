#define VERBOSE (0)
#include "SysDisplay.h"
#include "SysTouchManager.h"
#include "SysGuiButton.h"
#include "SysLog.h"


/// @brief コンストラクタ
/// @param argSprite 
/// @param width 
/// @param height 
SysGuiButton::SysGuiButton(SysSprite *argSprite, int width, int height)
    : _Sprite(argSprite)
    , _Width(width)
    , _Height(height)
    , _NeedToUpdate(false)
    , _Touched(false)
    , _Reaction(nullptr)
{
    _Label[0] = '\0';
    _LastDrawX = SysDisplay::getInstance().getWidth();
    _LastDrawY = SysDisplay::getInstance().getHeight();
}

/// @brief デストラクタ
SysGuiButton::~SysGuiButton()
{
}

/// @brief 更新処理
void SysGuiButton::update()
{
    // 判定とイベント処理
    auto touch_now = SysTouchManager::getInstance().isTouched(_LastDrawX, _LastDrawY, _Width, _Height);
    if(_Reaction != nullptr)
    {
        if(touch_now)
        {
            if(_Touched)
            {
                _Reaction->onGuiButtonPressing(_Label);
            }
            else
            {
                _Reaction->onGuiButtonContacted(_Label);
            }
        }
        else if(_Touched == true)
        {
            _Reaction->onGUiButtonReleased(_Label);
        }
    }

    // コンテキストの更新
    _NeedToUpdate |= touch_now != _Touched;
#if VERBOSE
    SysLog::printf(__NAMEOF__(SysGuiButton), "touch_now(%d, %d, %d, %d) %d > %d", _LastDrawX, _LastDrawY, _Width, _Height, _Touched, touch_now );
#endif
    _Touched = touch_now;
    _LastDrawX = SysDisplay::getInstance().getWidth();
    _LastDrawY = SysDisplay::getInstance().getHeight();
}

/// @brief 描画処理
/// @param x 
/// @param y 
void SysGuiButton::draw(int x, int y)
{
    if( _NeedToUpdate )
    {
        _Sprite->fillRect(0, 0, _Width, _Height, _Touched ? TFT_DARKCYAN : TFT_BLACK);
        _Sprite->drawRect(0, 0, _Width, _Height, TFT_WHITE);
        _Sprite->drawText(3, 20, _Label);
        _NeedToUpdate = false;
    }

    _Sprite->draw(x, y);
    _LastDrawX = x;
    _LastDrawY = y;
}

/// @brief ラベルの設定
/// @param label 
void SysGuiButton::setLabel(const char *label)
{
    strncpy(_Label, label, sizeof(_Label));
    _Label[sizeof(_Label)-1] = '\0';
    _NeedToUpdate = true;
}

/// @brief リアクション処理との紐付け
/// @param reaction 
void SysGuiButton::bind(SysGuiButtonReaction *reaction)
{
    _Reaction = reaction;
}