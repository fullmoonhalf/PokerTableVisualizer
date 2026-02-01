#ifndef _INCLUDED_SYS_DISPLAY
#define _INCLUDED_SYS_DISPLAY
#include <M5Unified.h>
#include "SysSingleton.h"
#include "SysSprite.h"


class SysDisplay : public SysSingletonBase<SysDisplay>
{
    friend class SysSingletonBase<SysDisplay>;

public:
    void init();
    int getWidth();
    int getHeight();
    void clear();
    void setBrightness(int brightness);
    void setEnable(bool enable);
    
    SysSprite *createSprite(int width, int height);
    void destroySprite(SysSprite *sprite);

private:
    SysDisplay();

    M5GFX Display;
    int _Width;
    int _Height;
    int _Brightness;
    bool _Enable;
};


#endif // _INCLUDED_SYS_DISPLAY
