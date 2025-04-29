#ifndef APP_REPORTER_H
#define APP_REPORTER_H
#include <M5Unified.h>
#include <BLEDevice.h>
#include <BLE2902.h>


class AppReportSourceable
{
public:
    virtual int tryGetStatus(char *buffer) = 0;
    virtual void flushSource() = 0;
};


class AppReporter : public BLEServerCallbacks
{
public:
    AppReporter(const char *identifier, const char *service_uuid, const char *characteristics_uuid);

    void setup();
    void update();
    void process();
    void bind(AppReportSourceable *argCardReader);

    int getFrameCount();

private:
    void onConnect(BLEServer *pServer);
    void onDisconnect(BLEServer *pServer);

private:
    BLEServer *_BLEServer;
    BLEService *_BLEService;
    BLECharacteristic *_BLECharacteristic;
    BLEAdvertising *_BLEAdvertising;

    AppReportSourceable *_CardReader;
    int _FrameCount;
    bool _Connected;
};


#endif /* APP_REPORTER_H */
