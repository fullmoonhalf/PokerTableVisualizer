#ifndef _INCLUDED_SYS_LOG_H
#define _INCLUDED_SYS_LOG_H
#include "SysUtils.h"

class SysLog
{
public:
    static void printf(const char *category, const char *format, ...);
};


#endif // _INCLUDED_SYS_LOG_H
