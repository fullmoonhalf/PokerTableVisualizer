#ifndef _INCLUDED_SYS_BLE_CONTROL
#define _INCLUDED_SYS_BLE_CONTROL
#include <BLEDevice.h>
#include <BLE2902.h>



class SysBLECharacteristicValueSourceable
{
public:
    virtual bool tryGetBLECharacteristicValue(char *outTarget, int outBufferSize) = 0;
};



class SysBLEControl : public BLEServerCallbacks
{
public:
    SysBLEControl(const char *identifier, const char *service_uuid, const char *characteristics_uuid);

    void notify(const char *source);
    void bind(SysBLECharacteristicValueSourceable *source);
    int getConnectionCount();

private:
    void onConnect(BLEServer *pServer);
    void onDisconnect(BLEServer *pServer);

private:
    BLEServer *_BLEServer;
    BLEService *_BLEService;
    BLECharacteristic *_BLECharacteristic;
    BLEAdvertising *_BLEAdvertising;
    SysBLECharacteristicValueSourceable *_CharacteristicValueSourceable;
    int _ConnectionConut;
};


#endif //  _INCLUDED_SYS_BLE_CONTROL
