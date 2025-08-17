#include "SysI2CUtil.h"
#include "AppCardListenerUnitRfid2Base.h"
#include "AppCardListenerUnitRfid2.h"
#include "AppCardListenerMultiRfid2.h"


/// @brief 
/// @return 
AppCardListenerUnitRfid2Base *AppCardListenerUnitRfid2Base::createCardListener()
{
    // Hub 経由のリーダー
    SysI2CUtil i2c;
    if(i2c.checkAlive(PaHub_I2C_ADDRESS))
    {
        return new AppCardListenerMultiRfid2();
    }

    // 単体リーダー
    return new AppCardListenerUnitRfid2();
}

