#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppModeDeckcheck.h"
#include "AppDrawablePlaycard.h"
#include "AppCardListenerUnitRfid2.h"

 
void AppModeDeckcheck::start()
{
    SysDisplay::getInstance().clear();

    // カードリーダー初期化
    _CardReader = new AppCardListenerUnitRfid2();
    _CardReader->init();

    // カードスプライトの生成
    for(int index=1; index<=52; ++index)
    {
        _Cards[index] = createPlaycardSprite(index);
        _Exist[index] = false;
    }
    _NeedToDraw = true;
}

void AppModeDeckcheck::end()
{
    // カードスプライトの破棄
    for(int index=1; index<=52; ++index)
    {
        SysSpriteManager::getInstance().destroySprite(_Cards[index]);
    }
}


void AppModeDeckcheck::update()
{
    AppCardInfo info[8];
    int count = _CardReader->scanWithInfo(500, info);
    for(int index=0; index<count; ++index)
    {
        int card = info[index].info[1];
        if(card < 1 || card > 52)
        {
            continue;
        }
        if(_Exist[card])
        {
            continue;
        }
        _Exist[card] = true;
        _NeedToDraw = true;
    }
}

void AppModeDeckcheck::draw()
{
    if(_NeedToDraw)
    {
        for(int index=1; index<=52; ++index)
        {
            if(_Exist[index])
            {
                int x = ((index - 1) % 13) * 17;
                int y = ((index - 1) / 13) * 33;
                _Cards[index]->draw(x, y);
            }
        }
        _NeedToDraw = false;
    }
}
