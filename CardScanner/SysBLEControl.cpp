#include "SysUtils.h"
#include "SysLog.h"
#include "SysBLEControl.h"


/// @brief コンストラクタ
/// @param card_reader 
SysBLEControl::SysBLEControl(const char *identifier, const char *service_uuid, const char *characteristics_uuid)
    : _BLEServer( nullptr )
    , _BLEService( nullptr )
    , _BLECharacteristic( nullptr )
    , _BLEAdvertising( nullptr )
    , _CharacteristicValueSourceable( nullptr )
    , _ConnectionConut( 0 )
{
    SysLog::printf(__NAMEOF__(SysBLEControl), "identifier=%s service_uuid=%s characteristics_uuid=%s", identifier, service_uuid, characteristics_uuid);
    BLEDevice::init(identifier);

    _BLEServer = BLEDevice::createServer();
    _BLEServer->setCallbacks(this);

    _BLEService = _BLEServer->createService(service_uuid);
    _BLECharacteristic = _BLEService->createCharacteristic(characteristics_uuid, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY );
    _BLECharacteristic->addDescriptor(new BLE2902());
    _BLECharacteristic->setValue("");
    _BLEService->start();

    _BLEAdvertising = BLEDevice::getAdvertising();
    _BLEAdvertising->addServiceUUID(service_uuid);
    _BLEAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();
}


/// @brief 
/// @param source 
void SysBLEControl::bind(SysBLECharacteristicValueSourceable *source)
{
    _CharacteristicValueSourceable = source;
}


/// @brief 送信
/// @param source 
void SysBLEControl::notify(const char *source)
{
#if VERBOSE
    SysLog::printf(__NAMEOF__(SysBLEControl), "notify '%s'", source);
#endif
    _BLECharacteristic->setValue(source);
    _BLECharacteristic->notify();
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


/// @brief 現在のコネクション数を取得する
/// @return 
int SysBLEControl::getConnectionCount()
{
    return _ConnectionConut;
}
