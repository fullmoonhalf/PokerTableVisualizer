#ifndef _INCLUDED_SYS_TOUCH_MANAGER
#define _INCLUDED_SYS_TOUCH_MANAGER
#include "SysSingleton.h"

#define SYS_TOUCH_INFO_CAPACITY (4)

class SysTouchInfo
{
public:
    int X;
    int Y;
};


class SysTouchManager : public SysSingletonBase<SysTouchManager>
{
    friend class SysSingletonBase<SysTouchManager>;

public:
    void init();
    void update();
    bool isTouched(int x, int y, int w, int h);

private:
    SysTouchManager();

    int _TouchCount;
    SysTouchInfo _TouchInfo[SYS_TOUCH_INFO_CAPACITY];
};


#endif // _INCLUDED_SYS_TOUCH_MANAGER
