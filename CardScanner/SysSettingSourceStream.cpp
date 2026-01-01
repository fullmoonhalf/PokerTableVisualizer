#include <M5Unified.h>
#include "SD.h"
#include "SysSetting.h"
#include "SysLog.h"


/// @brief コンストラクタ
SysSettingSDFileStream::SysSettingSDFileStream()
    : _FP( nullptr ) 
{
}


/// @brief ファイルロード
/// @param filename ファイル名
/// @return 読めるかどうか
bool SysSettingSDFileStream::load(const char *filename)
{
    if(!SD.exists(filename)) 
    {
        SysLog::printf(__NAMEOF__(SysSettingSDFileStream), "%s is not found.", filename);
        return false;
    }

    delay(500);
    _FP = SD.open(filename, FILE_READ); 
    if(!_FP)
    {
        SysLog::printf(__NAMEOF__(SysSettingSDFileStream), "%s can not open.", filename);
        return false;
    }

    return true;
}


/// @brief 読み取り可能かどうかを調べる
/// @return true: 読み取り可能。 false: 読み取り不能
bool SysSettingSDFileStream::available()
{
    return _FP.available();
}


/// @brief 1 文字読み取り
/// @return 読みとった文字列
char SysSettingSDFileStream::read()
{
    return (char)_FP.read();
}



/// @brief コンストラクタ
/// @param source 読み取り文字列
SysSettingStringStream::SysSettingStringStream(const char *source)
    : _Source( source )
    , _Seek( source )
{
}


/// @brief 読み取り可能かどうかを調べる
/// @return true: 読み取り可能。 false: 読み取り不能
bool SysSettingStringStream::available()
{
    return *_Seek != '\0';
}


/// @brief 1 文字読み取り
/// @return 読みとった文字列
char SysSettingStringStream::read()
{
    char value = *_Seek;
    _Seek++;
    return value;
}
