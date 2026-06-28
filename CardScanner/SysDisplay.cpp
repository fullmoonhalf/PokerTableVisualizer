#include "SysDisplay.h"
#include "SysLog.h"


/// @brief コンストラクタ
SysDisplay::SysDisplay()
    : _Width(-1)
    , _Height(-1)
    , _Brightness(-1)
    , _Enable(true)
    , _Display(nullptr)
{
}


/// @brief 初期化
void SysDisplay::init()
{
    SysLog::printf(__NAMEOF__(SysDisplay), "init() - start");
    {
        _Display = &M5.Display;
        _Display->wakeup();
        _Display->setBrightness(255);
        _Display->fillScreen(TFT_BLACK);
        _Width = _Display->width();   // 横幅（ピクセル）
        _Height = _Display->height();  // 高さ（ピクセル）
        SysLog::printf(__NAMEOF__(SysDisplay), "init() - display initialized. width=%d, height=%d", _Width, _Height);
   }
    SysLog::printf(__NAMEOF__(SysDisplay), "init() - end");
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
    auto device_sprite = new LGFX_Sprite( _Display );
    device_sprite->setPsram(true);
    device_sprite->createSprite(width, height);
    device_sprite->setColorDepth( _Display->getColorDepth() );
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
    _Display->fillScreen(TFT_BLACK);
}


/// @brief 明るさ調整
/// @param brightness 
void SysDisplay::setBrightness(int brightness)
{
    if(_Brightness != brightness)
    {
        _Display->setBrightness(brightness);
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
        _Display->wakeup(); // ON
    }
    else
    {
        _Display->sleep();   // 画面OFF
    }
}
