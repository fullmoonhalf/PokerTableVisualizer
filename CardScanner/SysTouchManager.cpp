#include <M5Unified.h>
#include "SysTouchManager.h"
#include "SysLog.h"


/// @brief コンストラクタ
SysTouchManager::SysTouchManager()
    : _TouchCount(0)
{
}

/// @brief 初期化
void SysTouchManager::init()
{
}

/// @brief 更新処理
void SysTouchManager::update()
{
    _TouchCount = M5.Touch.getCount();
    if(_TouchCount > SYS_TOUCH_INFO_CAPACITY)
    {
        _TouchCount = SYS_TOUCH_INFO_CAPACITY;
    }

    for(int index=0; index<_TouchCount; ++index)
    {
        auto touch_point = M5.Touch.getTouchPointRaw(index);
        _TouchInfo[index].X = touch_point.x;
        _TouchInfo[index].Y = touch_point.y;
    }
}

/// @brief 接触判定
/// @param x 
/// @param y 
/// @param w 
/// @param h 
/// @return 
bool SysTouchManager::isTouched(int x, int y, int w, int h)
{
    for(int index=0; index<_TouchCount; ++index)
    {
        auto dx = _TouchInfo[index].X - x;
        auto dy = _TouchInfo[index].Y - y;
        if(dx >= 0 && dx < w && dy >= 0 && dy < h)
        {
            return true;
        }
    }

    return false;
}
