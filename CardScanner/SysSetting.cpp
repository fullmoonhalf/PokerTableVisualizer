#include <M5Unified.h>
#include "SD.h"
#include "SysLog.h"
#include "SysUtils.h"
#include "SysSetting.h"


const char *SETTING_FILEPATH = "/ini.txt";


/// @brief コンストラクタ
SysSetting::SysSetting()
{
}


/// @brief 設定
/// @param key キー
/// @param value 値
void SysSetting::set(const char *key, const char *value)
{
    String _key(key);
    String _value(value);
    _Collection[_key] = _value;
}


/// @brief 設定取得
/// @param key キー 
/// @return 値
String SysSetting::get(const char *key)
{
    String _key(key);
    return _Collection[_key];
}


/// @brief 
/// @param key 
/// @return 
int SysSetting::getAsInt(const char *key)
{
    String value = get(key);
    int result = atoi(value.c_str());
    return result;
}


/// @brief 設定ファイルをロードする
/// @return 成否
bool SysSetting::load()
{
    SysSettingSDFileStream stream;
    if(stream.load(SETTING_FILEPATH) == false)
    {
        SysLog::printf(__NAMEOF__(SysSetting), "load failure");
        return false;
    }

    return loadFromStream(&stream);
}


bool SysSetting::loadFromStream(SysSettingSourceStream *stream)
{
    String token = "";
    String key="";
    bool is_valid = true;

    while(stream->available())
    {
        char data = stream->read();
        is_valid = false;
        switch(data)
        {
            case '=':
                key = String(token);
                token = "";
                break;
            case '\r':
            case '\n':
                if(key != "")
                {
                    _Collection[key] = token;
                }
                key = "";
                token = "";
                is_valid = true;
                break;
            default:
                token = token + data;
                break;
        }
    }

    dump();
    return is_valid;
}



/// @brief 設定値をシリアルに出力する
void SysSetting::dump()
{
    for (const auto& [key, value] : _Collection)
    {
        SysLog::printf(__NAMEOF__(SysSetting), "key='%s' value='%s'", key.c_str(), value.c_str());
    }
}
