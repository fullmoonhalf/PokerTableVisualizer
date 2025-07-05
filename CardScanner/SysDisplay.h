#ifndef _INCLUDED_SYS_DISPLAY
#define _INCLUDED_SYS_DISPLAY
#include <M5Unified.h>
#include "SysSprite.h"


class SysDisplay
{
public:
    SysDisplay();
    void init();
    SysSprite *createSprite(int width, int height);

public:
    M5GFX Display;
};


#endif // _INCLUDED_SYS_DISPLAY
