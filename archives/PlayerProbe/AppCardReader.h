#ifndef APP_CARDREADER
#define APP_CARDREADER
#include "UhfRfidDriver.h"
#include "AppReporter.h"
#include "AppPlaycardSprites.h"


class AppCardReader : public UhfRfidFrameReceivable, public AppReportSourceable
{
public:
    AppCardReader();
    virtual void onReceive(UhfRfidFrame *frame);
    void reset();
    void recognize(int card_index);
    void draw(AppPlaycardSprites *sprites);
    virtual int tryGetStatus(char *buffer);
    virtual void flushSource();

private:
    bool _StatusUpdated = false;
    bool _RecognizedCards[52+1];
    int _LastDrawCount;
}; 



#endif /* APP_CARDREADER */
