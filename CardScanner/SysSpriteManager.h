#ifndef _INCLUDED_SYS_SPRITE_MANAGER
#define _INCLUDED_SYS_SPRITE_MANAGER
#include "SysSingleton.h"
#include "SysDisplay.h"
#include "SysSprite.h"
#include "SysGuiGauge.h"


class SysSpriteManager : public SysSingletonBase<SysSpriteManager>
{
    friend class SysSingletonBase<SysSpriteManager>;

public:
    void bind(SysDisplay *argDisplay);
    SysSprite *createSprite(int width, int height);
    SysGuiGauge *createGauge(int width, int height, int current_value, int max_value);

private:
    SysSpriteManager();

    SysDisplay *_Display;
};


#endif // _INCLUDED_SYS_SPRITE_MANAGER
