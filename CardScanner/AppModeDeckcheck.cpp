#include "SysDisplay.h"
#include "SysSpriteManager.h"
#include "AppModeDeckcheck.h"
#include "AppDrawablePlaycard.h"
#include "AppCardListenerUnitRfid2.h"

 
void AppModeDeckcheck::start()
{
    SysDisplay::getInstance().clear();

    // カードリーダー初期化
    _CardReader = AppCardListenerUnitRfid2Base::createCardListener();
    _CardReader->init();

    // カードスプライトの生成
    for(int index=1; index<=52; ++index)
    {
        _Cards[index] = createPlaycardSprite(index);
        _Exist[index] = false;
    }
    _ButtonClear = SysSpriteManager::getInstance().createButton(64, 32, "Clear", this);
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

    _ButtonClear->update();
}


void AppModeDeckcheck::draw()
{
    int display_width = SysDisplay::getInstance().getWidth();
    int display_height = SysDisplay::getInstance().getHeight();
    _ButtonClear->draw((display_width - 64)/2, display_height - 64);

    if(_NeedToDraw)
    {
        const int CARD_WIDTH = 16;
        const int CARD_HEIGHT = 32;
        const int CARD_MARGIN = 2;
        const int CARD_TOP_MARGIN = 8;
        int card_left_x = (display_width - (CARD_WIDTH * 13 + CARD_MARGIN * 12)) / 2; 

        for(int index=1; index<=52; ++index)
        {
            if(_Exist[index])
            {
                int x = card_left_x + ((index - 1) % 13) * (CARD_WIDTH + CARD_MARGIN);
                int y = CARD_TOP_MARGIN + ((index - 1) / 13) * (CARD_HEIGHT + CARD_MARGIN);
                _Cards[index]->draw(x, y);
            }
        }

        _NeedToDraw = false;
    }
}


void AppModeDeckcheck::onGUiButtonReleased(const char *label)
{
    for(int index=1; index<=52; ++index)
    {
        _Exist[index] = false;
    }
    SysDisplay::getInstance().clear();
    _NeedToDraw = true;
}
