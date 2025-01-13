// reference: https://qiita.com/Teach/items/629c338da05a3134a1eb
#include "AppReporter.h"




/// @brief コンストラクタ
/// @param card_reader 
AppReporter::AppReporter(const char *identifier, const char *service_uuid, const char *characteristics_uuid, AppCardReader *card_reader)
    : _BLEServer( nullptr )
    , _BLEService( nullptr )
    , _BLECharacteristic( nullptr )
    , _BLEAdvertising( nullptr )
    , _CardReader( nullptr )
    , _FrameCount( 0 )
    , _Connected( false )
{
    BLEDevice::init(identifier);

    _BLEServer = BLEDevice::createServer();
    _BLEServer->setCallbacks(this);

    _BLEService = _BLEServer->createService(service_uuid);
    _BLECharacteristic = _BLEService->createCharacteristic(characteristics_uuid, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);
    _BLECharacteristic->addDescriptor(new BLE2902());
    _BLECharacteristic->setValue("");
    _BLEService->start();

    _BLEAdvertising = BLEDevice::getAdvertising();
    _BLEAdvertising->addServiceUUID(service_uuid);
    _BLEAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();
}


/// @brief セットアップ
void AppReporter::setup()
{
}


/// @brief 更新
void AppReporter::update()
{
}


/// @brief スレッドドライバ
void AppReporter::process()
{
    for(_FrameCount = 0;;++_FrameCount)
    {
        if(_Connected)
        {
            char buffer[256];
            if(_CardReader->tryGetStatus(buffer))
            {
                _BLECharacteristic->setValue(buffer);
                _BLECharacteristic->notify();
                Serial.printf("[AppReporter] notify '%s'\r\n", buffer);
            }
        }

        // ちょいまち
        delay(50);
    }
}


/// @brief ステータス文字列の取得
int AppReporter::getFrameCount()
{
    return _FrameCount;
}


/// @brief 
/// @param pServer 
void AppReporter::onConnect(BLEServer *pServer)
{
    Serial.println("[AppReporter] Connected.");
    _Connected = true;
}


/// @brief 
/// @param pServer 
void AppReporter::onDisconnect(BLEServer *pServer)
{
    Serial.println("[AppReporter] Disconnected.");
    _Connected = false;
}