#include "SysLog.h"
#include "SysModeManager.h"


/// @brief コンストラクタ
SysModeManager::SysModeManager()
    : _CurrentMode(nullptr)
    , _NextMode(nullptr)
    , _RegistedModeCollection(nullptr)
    , _RegistedModeCapacity(0)
    , _DestroyCurrentModeOnTransit(false)
    , _DestroyNextModeOnTransit(false)
{
}

/// @brief 初期化処理
/// @param 常駐モードのキャパ
void SysModeManager::init(int inRegistModeCapacity)
{
    _RegistedModeCapacity = inRegistModeCapacity;
    _RegistedModeCollection = new SysMode *[inRegistModeCapacity];
    for(int index=0; index<inRegistModeCapacity; ++index)
    {
        _RegistedModeCollection[index] = nullptr;
    }
}

/// @brief 常駐モード登録
/// @param index インデックス
/// @param inMode モード
void SysModeManager::bind(int index, SysMode *inMode)
{
    _RegistedModeCollection[index] = inMode;
}

/// @brief 遷移
/// @param index 次モード
void SysModeManager::transit(int index)
{
    transit(_RegistedModeCollection[index], false);
}

/// @brief 遷移
/// @param inNextMode 次モード
void SysModeManager::transit(SysMode *inNextMode, bool destroy)
{
    _NextMode = inNextMode;
    _DestroyNextModeOnTransit = destroy;
}

/// @brief 更新処理
void SysModeManager::update()
{
    if(_NextMode != nullptr)
    {
        SysLog::printf(__NAMEOF__(CardScanner), "change mode %p to %p", _CurrentMode, _NextMode);
        if(_CurrentMode != nullptr)
        {
            _CurrentMode->end();
            if(_DestroyCurrentModeOnTransit)
            {
                delete _CurrentMode;
            }
        }
        _CurrentMode = _NextMode;
        _DestroyCurrentModeOnTransit = _DestroyNextModeOnTransit;
        _NextMode = nullptr;
        if(_CurrentMode != nullptr)
        {
            _CurrentMode->start();
        }
    }

    if(_CurrentMode != nullptr)
    {
        _CurrentMode->update();
    }
}

/// @brief 描画処理
void SysModeManager::draw()
{
    if(_CurrentMode != nullptr)
    {
        _CurrentMode->draw();
    }
}
