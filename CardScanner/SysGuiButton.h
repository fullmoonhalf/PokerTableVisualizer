#ifndef _INCLUDED_SYS_GUI_BUTTON
#define _INCLUDED_SYS_GUI_BUTTON
#include "SysDrawable.h"
#include "SysSprite.h"




class SysGuiButtonReaction
{
public:
    virtual void onGuiButtonContacted(const char *label);
    virtual void onGuiButtonPressing(const char *label);
    virtual void onGUiButtonReleased(const char *label);
};



class SysGuiButton : public SysDrawable
{
public:
    SysGuiButton(SysSprite *argSprite, int width, int height);
    ~SysGuiButton();

    virtual void draw(int x, int y);
    void update();
    void setLabel(const char *label);
    void bind(SysGuiButtonReaction *reaction);

private:
    SysSprite *_Sprite;

    char _Label[64];
    int _LastDrawX;
    int _LastDrawY;
    int _Width;
    int _Height;
    bool _NeedToUpdate;
    bool _Touched;
    SysGuiButtonReaction *_Reaction;
};


#endif // _INCLUDED_SYS_GUI_BUTTON
