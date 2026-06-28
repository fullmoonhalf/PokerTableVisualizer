#ifndef _INCLUDED_SYS_HARDWARE_SPECIFICATION
#define _INCLUDED_SYS_HARDWARE_SPECIFICATION
#include <M5Unified.h>
#include "SysSingleton.h"


class SysHardwareSpecification : public SysSingletonBase<SysHardwareSpecification>
{
    friend class SysSingletonBase<SysHardwareSpecification>;

public:
    SysHardwareSpecification();

    int getGpioPinIdForSdCardCs();
};


#endif // _INCLUDED_SYS_HARDWARE_SPECIFICATION
