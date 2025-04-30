#ifndef APP_MODE_PROBE_H
#define APP_MODE_PROBE_H
#include "AppMode.h"
#include "UhfRfidDriver.h"
#include "AppDisplay.h"
#include "SysSetting.h"
#include "AppReporter.h"
#include "AppStatusPanel.h"




struct AppModeProbeCardInfo
{
    int DeckIndex = -1;
    int CardIndex = -1;
};

struct AppModeProbeSendInfo
{
    AppModeProbeCardInfo *CardInfoList = nullptr;
    int Capacity = 0;
    int CurrentNum = 0;
};


/// @brief 
class AppModeProbeContext
{
public: 
    int FrameCount = 0;
    char ProbeName[32];
    AppModeProbeSendInfo SendInfo[2];
    int CurrentRecvIndex = 0;
    int CurrentSendIndex = -1;

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
    void init(UhfRfidDriver *argUhfRfidDriver, AppDisplay *argDisplay, AppReporter *argReporter, const char *argProbeName, int argCardCapacity);
    virtual void update();
    virtual void draw();
    virtual void onReceive(UhfRfidFrame *frame);
    virtual int tryGetStatus(char *buffer);
    virtual void flushSource();

private:
    AppModeProbeContext _Context;
};


#endif // APP_MODE_PROBE_H
