#ifndef _INCLUDED_SYS_BLE_CONTROL
#define _INCLUDED_SYS_BLE_CONTROL
#include <BLEDevice.h>
#include <BLE2902.h>


class SysBLEControl : public BLEServerCallbacks
{
public:
    SysBLEControl(const char *identifier, const char *service_uuid, const char *characteristics_uuid);

    void process();
    int getFrameCount();

private:
    void onConnect(BLEServer *pServer);
    void onDisconnect(BLEServer *pServer);

private:
    BLEServer *_BLEServer;
    BLEService *_BLEService;
    BLECharacteristic *_BLECharacteristic;
    BLEAdvertising *_BLEAdvertising;

    int _FrameCount;
    bool _Connected;

};


#endif //  _INCLUDED_SYS_BLE_CONTROL
