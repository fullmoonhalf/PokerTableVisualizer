#ifndef SYS_SETTING_H
#define SYS_SETTING_H
#include <map>


class SysSetting
{
public:
    SysSetting();
    void set(const char *key, const char *value);
    String get(const char *key);
    int getAsInt(const char *key);
    bool load();
    void dump();

private:
    std::map<String, String> _Collection;
};


#endif /* SYS_SETTING_H */
