#ifndef _SYS_MODE_MANAGER
#define _SYS_MODE_MANAGER
#include "SysSingleton.h"
#include "SysMode.h"


class SysModeManager : public SysSingletonBase<SysModeManager>
{
    friend class SysSingletonBase<SysModeManager>;

public:
    void init(int inRegistModeCapacity);
    void bind(int index, SysMode *inMode);
    void transit(SysMode *inNextMode);
    void transit(int index);
    void update();
    void draw();

private:
    SysModeManager();

    SysMode **_RegistedModeCollection;
    int _RegistedModeCapacity;
    SysMode *_CurrentMode;
    SysMode *_NextMode;
};



#endif // _SYS_MODE_MANAGER