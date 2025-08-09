#ifndef _INCLUDED_SYS_SPRITE
#define _INCLUDED_SYS_SPRITE
#include <M5Unified.h>
#include "SysDrawable.h"


class SysSprite : public SysDrawable
{
public:
    SysSprite(LGFX_Sprite *argSprite);
    ~SysSprite();

    virtual void draw(int x, int y);
    void fillRect(int x, int y, int w, int h, int color);
    void drawRect(int x, int y, int w, int h, int color);
    void drawText(int x, int y, const char *text);

private:
    LGFX_Sprite *_Sprite;
};


#endif // _INCLUDED_SYS_SPRITE

