#include "SysUtils.h"
#include "SysBLEControl.h"


/// @brief コンストラクタ
/// @param card_reader 
SysBLEControl::SysBLEControl(const char *identifier, const char *service_uuid, const char *characteristics_uuid)
    : _BLEServer( nullptr )
    , _BLEService( nullptr )
    , _BLECharacteristic( nullptr )
    , _BLEAdvertising( nullptr )
    , _CharacteristicValueSourceable( nullptr )
    , _FrameCount( 0 )
    , _Connected( false )
{
//    Serial.printf("[SysBLEControl] identifier=%s service_uuid=%s characteristics_uuid=%s\r\n", identifier, service_uuid, characteristics_uuid);
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


/// @brief スレッドドライバ
void SysBLEControl::process()
{
    char buffer[256];

    for(_FrameCount = 0;;++_FrameCount)
    {
        // ちょいまち
//        delay(50);

        if(_Connected == false)
        {
            continue;
        }

        if(_CharacteristicValueSourceable != nullptr)
        {
            if(_CharacteristicValueSourceable->tryGetBLECharacteristicValue(buffer, sizeof(buffer)))
            {
    //            Serial.printf("[AppReporter] notify '%s'\r\n", buffer);
                _BLECharacteristic->setValue(buffer);
                _BLECharacteristic->notify();
            }
        }
    }
}


/// @brief ステータス文字列の取得
int SysBLEControl::getFrameCount()
{
    return _FrameCount;
}


/// @brief 
/// @param pServer 
void SysBLEControl::onConnect(BLEServer *pServer)
{
//    Serial.println("[SysBLEControl] Connected.");
    _Connected = true;
}


/// @brief 
/// @param pServer 
void SysBLEControl::onDisconnect(BLEServer *pServer)
{
//    Serial.println("[SysBLEControl] Disconnected.");
    _Connected = false;
}
