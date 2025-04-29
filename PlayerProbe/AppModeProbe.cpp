#include "AppModeProbe.h"
#include "UhfRfidFrameParser.h"



void AppModeProbe::init(UhfRfidDriver *argUhfRfidDriver, AppDisplay *argDisplay, AppReporter *argReporter)
{
    _Context._RefUhfRfidDriver = argUhfRfidDriver;
    _Context._RefDisplay = argDisplay;
    _Context._RefReporter = argReporter;

    //
    _Context._RefUhfRfidDriver->regist(this, UhfRfidCommand::UhfRfidCommand_SinglePollingInstruction);
    _Context._RefReporter->bind(this);

    // ステータスパネル
    _Context._StatusPanel = new AppStatusPanel(_Context._RefDisplay);
    _Context._StatusPanel->setup();
    _Context._StatusPanel->bind(_Context._RefUhfRfidDriver);
    _Context._StatusPanel->bind(_Context._RefReporter);
    _Context._StatusPanel->dumpMemoryStatus();
}


void AppModeProbe::update()
{
    _Context.FrameCount++;
    if(_Context.FrameCount % 5 == 0)
    {
        _Context._RefUhfRfidDriver->commandSinglePollingInstruction();
    }

    _Context._StatusPanel->update();
    _Context._RefReporter->update();
}


void AppModeProbe::draw()
{
    _Context._StatusPanel->draw(10, 10);
}


void AppModeProbe::onReceive(UhfRfidFrame *frame)
{
    UhfRfidNotifyPollingParser parser(frame);
    uint8_t *epc = parser.getEPC();
    uint8_t deck_index = epc[10];
    uint8_t card_index = epc[11];
    Serial.printf("AppModeProbe::onReceive deck=%d card=%d\r\n", deck_index, card_index);
}


int AppModeProbe::tryGetStatus(char *buffer)
{
    return 0;
}


void AppModeProbe::flushSource()
{
}
