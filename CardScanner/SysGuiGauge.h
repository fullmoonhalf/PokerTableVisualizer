#ifndef _INCLUDED_SYS_GUI_GAUGE
#define _INCLUDED_SYS_GUI_GAUGE
#include "SysDrawable.h"
#include "SysSprite.h"


class SysGuiGauge : public SysDrawable
{
public:
    SysGuiGauge(SysSprite *argSprite, int current_value, int max_value, int width, int height);
    ~SysGuiGauge();

    virtual void draw(int x, int y);
    void update();
    void setCurrentValue(int current_value);

private:
    SysSprite *_Sprite;
    int _CurrentValue;
    int _MaxValue;
    int _Width;
    int _Height;
    bool _NeedToUpdate;
};


#endif // _INCLUDED_SYS_GUI_GAUGE
