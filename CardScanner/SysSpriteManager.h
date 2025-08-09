#ifndef _INCLUDED_SYS_SPRITE_MANAGER
#define _INCLUDED_SYS_SPRITE_MANAGER
#include "SysSingleton.h"
#include "SysSprite.h"
#include "SysGuiGauge.h"
#include "SysGuiButton.h"


class SysSpriteManager : public SysSingletonBase<SysSpriteManager>
{
    friend class SysSingletonBase<SysSpriteManager>;

public:
    SysSprite *createSprite(int width, int height);
    void destroySprite(SysSprite *sprite);
    void destroyDrawable(SysDrawable *drawable);

    // 機能性を持つオブジェクトを返す。SysDrawable を継承している必要がある。
    SysGuiGauge *createGauge(int width, int height, int current_value, int max_value);
    SysGuiButton *createButton(int width, int height, const char *label);

private:
    SysSpriteManager();
};


#endif // _INCLUDED_SYS_SPRITE_MANAGER
