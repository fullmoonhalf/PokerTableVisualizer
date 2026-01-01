#ifndef SYS_SETTING_H
#define SYS_SETTING_H
#include <map>
#include <M5Unified.h>
#include "SD.h"


class SysSettingSourceStream
{
public:
    virtual bool available() = 0;
    virtual char read() = 0;
};

class SysSettingSDFileStream : public SysSettingSourceStream
{
public:
    SysSettingSDFileStream();
    virtual bool load(const char *filename);
    virtual bool available();
    virtual char read();
private:
    File _FP;
};

class SysSettingStringStream : public SysSettingSourceStream
{
public:
    SysSettingStringStream();
    virtual bool set(const char *source);
    virtual bool available();
    virtual char read();
private:
    const char *_Source;
    const char *_Seek;
};


class SysSetting
{
public:
    SysSetting();
    void set(const char *key, const char *value);
    String get(const char *key);
    int getAsInt(const char *key);
    bool load();
    bool loadFromStream(SysSettingSourceStream *stream);
    void dump();

private:
    std::map<String, String> _Collection;
};



#endif /* SYS_SETTING_H */
