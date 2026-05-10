#include "SysUtils.h"
#include "SysLog.h"
#include "SysBLEControl.h"


/// @brief コンストラクタ
/// @param card_reader 
SysBLEControl::SysBLEControl(const char *identifier, const char *service_uuid, const char *characteristics_tx_uuid, const char *characteristics_rx_uuid)
    : _BLEServer( nullptr )
    , _BLEService( nullptr )
    , _BLECharacteristicTX( nullptr )
    , _BLECharacteristicRX( nullptr )
    , _CallbackRX( nullptr )
    , _BLEAdvertising( nullptr )
    , _ConnectionConut( 0 )
{
    SysLog::printf(__NAMEOF__(SysBLEControl), "identifier=%s service_uuid=%s characteristics_uuid=[tx=%s/rx=%s]", identifier, service_uuid, characteristics_tx_uuid, characteristics_rx_uuid);
    BLEDevice::init(identifier);

    _BLEServer = BLEDevice::createServer();
    _BLEServer->setCallbacks(this);

    _BLEService = _BLEServer->createService(service_uuid);
    {
        _BLECharacteristicTX = _BLEService->createCharacteristic(characteristics_tx_uuid, BLECharacteristic::PROPERTY_NOTIFY );
        _BLECharacteristicTX->addDescriptor(new BLE2902());
        _BLECharacteristicTX->setValue("");

        _BLECharacteristicRX = _BLEService->createCharacteristic(characteristics_rx_uuid, BLECharacteristic::PROPERTY_WRITE );
        _BLECharacteristicRX->setCallbacks(this);
    }
    _BLEService->start();

    _BLEAdvertising = BLEDevice::getAdvertising();
    _BLEAdvertising->addServiceUUID(service_uuid);
    _BLEAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();
}


/// @brief 送信
/// @param source 
void SysBLEControl::notify(const char *source)
{
#if VERBOSE
    SysLog::printf(__NAMEOF__(SysBLEControl), "notify '%s'", source);
#endif
    _BLECharacteristicTX->setValue(source);
    _BLECharacteristicTX->notify();
}


/// @brief 
/// @param argCallbackRX 
void SysBLEControl::bind(SysBLECallbackRX *argCallbackRX)
{
    SysLog::printf(__NAMEOF__(SysBLEControl), "bind %p.", argCallbackRX);
    _CallbackRX = argCallbackRX;
}


/// @brief 
/// @param pServer 
void SysBLEControl::onConnect(BLEServer *pServer)
{
    SysLog::printf(__NAMEOF__(SysBLEControl), "Connected.");
    _ConnectionConut++;
}


/// @brief 
/// @param pServer 
void SysBLEControl::onDisconnect(BLEServer *pServer)
{
    SysLog::printf(__NAMEOF__(SysBLEControl), "Disconnected.");
    _ConnectionConut--;
}


/// @brief 受信
/// @param pChar 
void SysBLEControl::onWrite(BLECharacteristic* pChar)
{
    if(_CallbackRX != nullptr)
    {
        String value = pChar->getValue();
        SysLog::printf(__NAMEOF__(SysBLEControl), "Received '%s' (%d bytes).", value.c_str(), value.length());
        _CallbackRX->onBLEWrite(value.c_str(), value.length());
    }
}


/// @brief 現在のコネクション数を取得する
/// @return 
int SysBLEControl::getConnectionCount()
{
    return _ConnectionConut;
}
