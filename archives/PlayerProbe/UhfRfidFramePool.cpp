#include "UhfRfidDriver.h"



/// @brief コンストラクタ
/// @param capacity 
/// @param buffer_size 
UhfRfidFramePool::UhfRfidFramePool(int capacity, int buffer_size)
{
    _Capacity = capacity;
    _Pool = new UhfRfidFrame[_Capacity];
    for(int index=0; index<_Capacity; ++index)
    {
        _Pool[index].init(buffer_size);
    }

    reset();
}


/// @brief プールから 1 つ使う。
/// @return 
UhfRfidFrame *UhfRfidFramePool::use()
{
    UhfRfidFrame *frame = _Pool + _UseWriteIndex;

    _UseWriteIndex++;
    if(_UseWriteIndex >= _Capacity)
    {
        _UseWriteIndex = 0;
    }

    // 一周まわっているので使わせない。みたいな処理を入れる必要はある。

    return frame;
}


/// @brief 使ったやつの FIX 化。
void UhfRfidFramePool::fix()
{
    _UseTailIndex = _UseWriteIndex;
}


/// @brief 使われたものを処理する
/// @return 
UhfRfidFrame *UhfRfidFramePool::process()
{
    if(_UseHeadIndex == _UseTailIndex)
    {
        return nullptr;
    }

    UhfRfidFrame *frame = _Pool + _UseHeadIndex;

    _UseHeadIndex++;
    if(_UseHeadIndex >= _Capacity)
    {
        _UseHeadIndex = 0;
    }

    return frame;

}


/// @brief リセット処理
void UhfRfidFramePool::reset()
{
    _UseHeadIndex = 0;
    _UseTailIndex = 0;
    _UseWriteIndex = 0;
}