#ifndef APP_MODE_DEVELOP_H
#define APP_MODE_DEVELOP_H
#include "AppMode.h"
#include "AppCommandPanel.h"
#include "AppPlaycardSprites.h"
#include "AppStatusPanel.h"
#include "AppCardReader.h"
#include "AppReporter.h"
#include "AppDisplay.h"
#include "SysSetting.h"


/// @brief 
class AppModeDevelopContext
{
public: 
    int argument_value = 1;
    bool polling_enable = false;
    int counter = 0;

    UhfRfidDriver *_RefUhfRfidDriver = nullptr;
    AppDisplay *_RefDisplay = nullptr;
    SysSetting *_RefSetting = nullptr;
    AppReporter *_RefReporter = nullptr;

    AppCardReader *_CardReader = nullptr;
    AppCommandPanel *_CommandPanel = nullptr;
    AppPlaycardSprites *_Playcards = nullptr;
    AppStatusPanel *_StatusPanel = nullptr;
};


/// @brief 
class AppModeDevelop : public AppMode
{
public:
    void init(UhfRfidDriver *argUhfRfidDriver, AppDisplay *argDisplay, SysSetting *argSetting, AppReporter *argReporter);
    virtual void update();
    virtual void draw();

private:
    AppModeDevelopContext _Context;
};


/// @brief 
class AppModeDevelop_Command : public AppCommand
{
public:
    AppModeDevelop_Command(AppModeDevelopContext &context) : _Context(context){};
protected:
    AppModeDevelopContext &_Context;
};


/// @brief 
#if 0
class AppModeDevelop_Command_Inc : public AppModeDevelop_Command
{
public:
    AppModeDevelop_Command_Inc(AppModeDevelopContext &context) : AppModeDevelop_Command(context){};
    virtual const char *getName();
    virtual void execute();
};
#endif


#define APP_MODE_DEVELOP_COMMAND(typename, name)    \
    class typename : public AppModeDevelop_Command  \
    {   \
    public: \
        typename(AppModeDevelopContext &context) : AppModeDevelop_Command(context){};   \
        virtual const char *getName(){ return name; }   \
        virtual void execute(); \
    }

APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_Inc, "Inc");
APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_Dec, "Dec");
APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_StartPolling, "Start");
APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_StopPolling, "Stop");
APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_ResetInventoryParam, "Reset Prm");
APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_GetInformations, "Get Info");
APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_EpcTest, "Write EPC");
APP_MODE_DEVELOP_COMMAND(AppModeDevelop_Command_ResetCardReader, "ResetRead");


#endif // APP_MODE_DEVELOP_H
