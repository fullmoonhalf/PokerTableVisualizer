#include <M5Unified.h>
#include "SD.h"
#include "SysSetting.h"
#include "SysLog.h"


SysSettingSDFileStream::SysSettingSDFileStream()
    : _FP( nullptr ) 
{
}


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

bool SysSettingSDFileStream::available()
{
    return _FP.available();
}

char SysSettingSDFileStream::read()
{
    return (char)_FP.read();
}




SysSettingStringStream::SysSettingStringStream()
    : _Source( nullptr )
    , _Seek( nullptr )
{
}

bool SysSettingStringStream::set(const char *source)
{
    _Source = source;
    _Seek = _Source;
}

bool SysSettingStringStream::available()
{
    return *_Seek != '\0';
}

char SysSettingStringStream::read()
{
    char value = *_Seek;
    _Seek++;
    return value;
}
