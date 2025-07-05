#ifndef _INCLUDED_SYS_SINGLETON
#define _INCLUDED_SYS_SINGLETON


template <typename T>
class SysSingletonBase {
public:
    // Singletonインスタンスの取得
    static T& getInstance() {
        return instance;
    }

    // コピー・ムーブの禁止
    SysSingletonBase(const SysSingletonBase&) = delete;
    SysSingletonBase& operator=(const SysSingletonBase&) = delete;
    SysSingletonBase(SysSingletonBase&&) = delete;
    SysSingletonBase& operator=(SysSingletonBase&&) = delete;

protected:
    SysSingletonBase() = default;
    virtual ~SysSingletonBase() = default;

private:
    inline static T instance;
};



#endif // _INCLUDED_SYS_SINGLETON