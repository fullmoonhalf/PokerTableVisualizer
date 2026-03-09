#ifndef APP_PLAYCARD_SPRITES
#define APP_PLAYCARD_SPRITES
#include <M5Unified.h>
#include "AppDisplay.h"



class AppPlaycardSprites
{
public:
    AppPlaycardSprites(AppDisplay *display);
    void init();
    void draw(int index, int x, int y);

private:
    LGFX_Sprite *_Sprites_Collection[1+52];
    AppDisplay *_Display;
};


#endif /* APP_PLAYCARD_SPRITES */
