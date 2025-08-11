#ifndef _INCLUDED_APP_MODE_WRITER
#define _INCLUDED_APP_MODE_WRITER
#include "SysMode.h"
#include "SysGuiButton.h"
#include "SysBLEControl.h"
#include "AppCardListenerUnitRfid2.h"



class AppModeWriter : public SysMode, public SysGuiButtonReaction
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();
    virtual void onGUiButtonReleased(const char *label);

private:
    AppCardListenerUnitRfid2 *_CardReader;
    SysGuiButton *_ButtonUpCard;
    SysGuiButton *_ButtonDownCard;
    SysGuiButton *_ButtonUpDeck;
    SysGuiButton *_ButtonDownDeck;
    SysGuiButton *_ButtonWrite;
    SysSprite *_LabelCard;
    SysSprite *_LabelDeck;

    int _CurrentCardIndex;
    int _CurrentDeckIndex;
    bool _NeedToUpdateCard;
    bool _NeedToUpdateDeck;
};


#endif // _INCLUDED_APP_MODE_WRITER
