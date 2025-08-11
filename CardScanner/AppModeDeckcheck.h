#ifndef _INCLUDED_APP_MODE_DECKCHECK
#define _INCLUDED_APP_MODE_DECKCHECK
#include "SysMode.h"
#include "AppCardListenerUnitRfid2.h"


class AppModeDeckcheck : public SysMode
{
public:
    virtual void start();
    virtual void end();
    virtual void update();
    virtual void draw();

private:
    AppCardListenerUnitRfid2 *_CardReader;
    SysSprite *_Cards[52+1];
    bool _Exist[52+1];
    bool _NeedToDraw;
};


#endif // _INCLUDED_APP_MODE_DECKCHECK
