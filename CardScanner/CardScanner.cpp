// M5stack 関連
#include <M5Unified.h>
// システム関連
#include "SysLog.h"
#include "SysUtils.h"
#include "SysModeManager.h"
#include "SysSpriteManager.h"
// アプリまわり
#include "AppMode.h"
#include "AppSetting.h"
#include "AppModeDevelop.h"
#include "AppModeReader.h"
#include "AppModeWriter.h"
#include "CardScanner.h"


#define BUTTON_WIDTH (96)
#define BUTTON_HEIGHT (64)
#define BUTTON_ANCHOR_X (32)
#define BUTTON_ANCHOR_Y (48)
#define BUTTON_MARGIN (16)
#define BUTTON_LABEL_READER ("Reader")
#define BUTTON_LABEL_WRITER ("Writer")
#define BUTTON_LABEL_DEVELOP ("Develop")


/// @brief 初期化処理
void CardScanner::setup()
{
    // Settings
    AppSetting::getInstance().init();

    // LCD
    SysDisplay::getInstance().init();

    // モード関連
    SysModeManager::getInstance().init(1);
    SysModeManager::getInstance().bind(APP_MODE_REGISTER_CARD_SCANNER, this);
    SysModeManager::getInstance().transit(APP_MODE_REGISTER_CARD_SCANNER);

}


/// @brief モード開始時処理
void CardScanner::start()
{
    _ButtonReader = SysSpriteManager::getInstance().createButton(BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_LABEL_READER, this);
    _ButtonWriter = SysSpriteManager::getInstance().createButton(BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_LABEL_WRITER, this);
    _ButtonDevelop = SysSpriteManager::getInstance().createButton(BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_LABEL_DEVELOP, this);
}

/// @brief モード終了時処理
void CardScanner::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_ButtonDevelop);
    SysSpriteManager::getInstance().destroyDrawable(_ButtonWriter);
    SysSpriteManager::getInstance().destroyDrawable(_ButtonReader);
}

/// @brief 更新処理
void CardScanner::update()
{
    _FrameCount++;
    _ButtonReader->update();
    _ButtonWriter->update();
    _ButtonDevelop->update();
}

/// @brief 描画処理
void CardScanner::draw()
{
    _ButtonReader->draw(BUTTON_ANCHOR_X, BUTTON_ANCHOR_Y);
    _ButtonWriter->draw(BUTTON_ANCHOR_X+BUTTON_WIDTH+BUTTON_MARGIN, BUTTON_ANCHOR_Y);
    _ButtonDevelop->draw(BUTTON_ANCHOR_X+BUTTON_WIDTH+BUTTON_MARGIN, BUTTON_ANCHOR_Y+BUTTON_HEIGHT+BUTTON_MARGIN);
}

/// @brief ボタン離したときの処理
/// @param label 
void CardScanner::onGUiButtonReleased(const char *label)
{
    SysLog::printf(__NAMEOF__(CardScanner), "onGUiButtonReleased(%s)", label);

    if(strcmp(label, BUTTON_LABEL_DEVELOP) == 0)
    {
        SysModeManager::getInstance().transit(new AppModeDevelop(), true);
    }
    else if(strcmp(label, BUTTON_LABEL_READER) == 0)
    {
        SysModeManager::getInstance().transit(new AppModeReader(), true);
    }
    else if(strcmp(label, BUTTON_LABEL_WRITER) == 0)
    {
        SysModeManager::getInstance().transit(new AppModeWriter(), true);
    }
}
