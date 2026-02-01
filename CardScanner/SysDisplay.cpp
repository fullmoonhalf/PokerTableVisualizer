#include "SysDisplay.h"


/// @brief コンストラクタ
SysDisplay::SysDisplay()
    : _Width(-1)
    , _Height(-1)
    , _Brightness(-1)
    , _Enable(true)
{
}


/// @brief 初期化
void SysDisplay::init()
{
    Display.begin();
    Display.fillScreen(TFT_BLACK);
    _Width = M5.Lcd.width();   // 横幅（ピクセル）
    _Height = M5.Lcd.height();  // 高さ（ピクセル）
}


/// @brief ディスプレイの幅を取得する。
/// @return 
int SysDisplay::getWidth()
{
    return _Width;
}


/// @brief ディスプレイの高さを取得する
/// @return 
int SysDisplay::getHeight()
{
    return _Height;
}


/// @brief スプライト生成
/// @param width 
/// @param height 
/// @return 
SysSprite *SysDisplay::createSprite(int width, int height)
{
    auto device_sprite = new LGFX_Sprite( &Display );
    device_sprite->setPsram(true);
    device_sprite->createSprite(width, height);
    device_sprite->setColorDepth( Display.getColorDepth() );
    auto sprite = new SysSprite(device_sprite);
    return sprite;
}


/// @brief スプライトの破棄
/// @param sprite 破棄対象となるsprite。delete も行なわれるので外側で delete しなくてよい。
void SysDisplay::destroySprite(SysSprite *sprite)
{
    // SysSprite 側の方で VRAM/PSRAM の破棄を行なうので、ここでは delete のみとなっている。
    delete sprite; 
}


/// @brief 画面クリア
void SysDisplay::clear()
{
    Display.fillScreen(TFT_BLACK);
}


/// @brief 明るさ調整
/// @param brightness 
void SysDisplay::setBrightness(int brightness)
{
    if(_Brightness != brightness)
    {
        M5.Lcd.setBrightness(brightness);
        _Brightness = brightness;
    }
}


void SysDisplay::setEnable(bool enable)
{
    // 状態がかわらないときには何もしない
    if(_Enable == enable)
    {
        return;
    }

    // 切り替え
    _Enable = enable;
    if(_Enable)
    {
        M5.Lcd.wakeup(); // ON
    }
    else
    {
        M5.Lcd.sleep();   // 画面OFF
    }
}
