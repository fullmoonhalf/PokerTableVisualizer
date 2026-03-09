#ifndef APP_DISPLAY
#define APP_DISPLAY
#include <M5Unified.h>


class AppDisplay
{
public:
    AppDisplay();
    void init();
    LGFX_Sprite *createSprite(int width, int height);


public:
    M5GFX Display;
};


#endif /* APP_DISPLAY */