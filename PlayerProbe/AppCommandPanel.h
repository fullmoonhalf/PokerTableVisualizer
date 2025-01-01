#ifndef APP_COMMAND_PANEL
#define APP_COMMAND_PANEL
#include <M5Unified.h>
#include "AppDisplay.h"


struct AppCommand
{
    const char *name;
    void (*func)();
};



class AppCommandPanel
{
public:
    AppCommandPanel(AppDisplay *display);

    void regist(AppCommand *command);
    void update(int touchX, int touchY);
    void draw();

    AppCommand *getSelected();
    void resetSelected();

private:
    int calcSelectedIndex(int touchX, int touchY);

    AppCommand *_Command_Collection[16];
    int _Command_Count;
    AppDisplay *_Display;
    LGFX_Sprite *_Sprites_Collection[16];

    int _Width;
    int _Height;
    int _ColNumPerLine;
    int _OffsetX;
    int _OffsetY;

    int _SelectedIndex;
    bool _RenewToDraw;
};


#endif /* APP_COMMAND_PANEL */