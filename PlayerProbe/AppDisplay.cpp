#include "AppDisplay.h"


/// @brief コンストラクタ
AppDisplay::AppDisplay()
{
}


/// @brief 初期化
void AppDisplay::init()
{
    Display.begin();
    Display.fillScreen(TFT_BLACK);
}
