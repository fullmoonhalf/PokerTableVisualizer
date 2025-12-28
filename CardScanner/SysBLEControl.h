#ifndef _INCLUDED_SYS_BLE_CONTROL
#define _INCLUDED_SYS_BLE_CONTROL
#include <BLEDevice.h>
#include <BLE2902.h>



class SysBLECallbackRX
{
public:
    virtual void onBLEWrite(const char *buffer, int size) = 0;
};



class SysBLEControl : public BLEServerCallbacks,  BLECharacteristicCallbacks
{
public:
    SysBLEControl(const char *identifier, const char *service_uuid, const char *characteristics_tx_uuid, const char *characteristics_rx_uuid);

    void bind(SysBLECallbackRX *argCallbackRX);
    void notify(const char *source);
    int getConnectionCount();

private:
    void onConnect(BLEServer *pServer);
    void onDisconnect(BLEServer *pServer);
    void onWrite(BLECharacteristic* pChar);

private:
    BLEServer *_BLEServer;
    BLEService *_BLEService;
    BLECharacteristic *_BLECharacteristicTX; // デバイス→ブラウザ
    BLECharacteristic *_BLECharacteristicRX; // ブラウザ→デバイス
    SysBLECallbackRX *_CallbackRX;

    BLEAdvertising *_BLEAdvertising;
    int _ConnectionConut;
};


#endif //  _INCLUDED_SYS_BLE_CONTROL
