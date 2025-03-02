#ifndef APP_MODE_PROBE_H
#define APP_MODE_PROBE_H
#include "AppMode.h"


class AppModeProbe : public AppMode
{
public:
    virtual void update();
    virtual void draw();
};


#endif // APP_MODE_PROBE_H
