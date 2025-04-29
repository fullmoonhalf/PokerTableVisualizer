#ifndef APP_MODE_PROBE_H
#define APP_MODE_PROBE_H
#include "AppMode.h"
#include "UhfRfidDriver.h"
#include "AppDisplay.h"
#include "SysSetting.h"
#include "AppReporter.h"
#include "AppStatusPanel.h"


/// @brief 
class AppModeProbeContext
{
public: 
    int FrameCount = 0;

    UhfRfidDriver *_RefUhfRfidDriver = nullptr;
    AppDisplay *_RefDisplay = nullptr;
    AppReporter *_RefReporter = nullptr;

    AppStatusPanel *_StatusPanel = nullptr;
};


/// @brief 
class AppModeProbe 
: public AppMode
, public UhfRfidFrameReceivable
, public AppReportSourceable
{
public:
    void init(UhfRfidDriver *argUhfRfidDriver, AppDisplay *argDisplay, AppReporter *argReporter);
    virtual void update();
    virtual void draw();
    virtual void onReceive(UhfRfidFrame *frame);
    virtual int tryGetStatus(char *buffer);
    virtual void flushSource();

private:
    AppModeProbeContext _Context;
};


#endif // APP_MODE_PROBE_H
