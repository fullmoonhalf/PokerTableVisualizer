#ifndef _INCLUDED_SYS_GUI_BUTTON
#define _INCLUDED_SYS_GUI_BUTTON
#include "SysDrawable.h"
#include "SysSprite.h"


class SysGuiButton : public SysDrawable
{
public:
    SysGuiButton(SysSprite *argSprite, int width, int height);
    ~SysGuiButton();

    virtual void draw(int x, int y);
    void update();
    void setLabel(const char *label);

private:
    SysSprite *_Sprite;

    char _Label[64];
    int _LastDrawX;
    int _LastDrawY;
    int _Width;
    int _Height;
    bool _NeedToUpdate;
    bool _Touched;
};


#endif // _INCLUDED_SYS_GUI_BUTTON
