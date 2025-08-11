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
    if(!SD.exists(SETTING_FILEPATH)) 
    {
        SysLog::printf(__NAMEOF__(SysSetting), "%s is not found.", SETTING_FILEPATH);
        return false;
    }

    delay(500);
    File fp = SD.open(SETTING_FILEPATH, FILE_READ); 
    if(!fp)
    {
        SysLog::printf(__NAMEOF__(SysSetting), "%s can not open.", SETTING_FILEPATH);
        return false;
    }

    {
        String token = "";
        String key="";
        while(fp.available())
        {
            char data = (char)fp.read();
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
                    break;
                default:
                    token = token + data;
                    break;
            }
        }
    }

    dump();
    
    return false;
}


/// @brief 設定値をシリアルに出力する
void SysSetting::dump()
{
    for (const auto& [key, value] : _Collection)
    {
        SysLog::printf(__NAMEOF__(SysSetting), "key='%s' value='%s'", key.c_str(), value.c_str());
    }
}
