#include "AppModeWriter.h"
#include "SysSpriteManager.h"
#include "SysDisplay.h"
#include "SysLog.h"

#define BUTTON_LABEL_UP_CARD        ("<-Card")
#define BUTTON_LABEL_DOWN_CARD      ("Card-->")
#define BUTTON_LABEL_UP_DECK        ("<-Deck")
#define BUTTON_LABEL_DOWN_DECK      ("Deck->")
#define BUTTON_LABEL_WRITE          ("Write")
#define BUTTON_SELECTOR_WIDTH       (64)
#define BUTTON_SELECTOR_HEIGHT      (64)
#define BUTTON_WRITE_WIDTH          (160)
#define BUTTON_WRITE_HEIGHT         (48)
#define BUTTON_LAYOUT_OUTER_MARGIN  (8)
#define BUTTON_LAYOUT_INNER_MARGIN  (16)
#define LABEL_WIDTH                 (64)
#define LABEL_HEIGHT                (32)


void AppModeWriter::start()
{
    SysDisplay::getInstance().clear();

    // カードリーダー初期化
    _CardReader = new AppCardListenerUnitRfid2();
    _CardReader->init();

    // ボタン初期化
    _ButtonUpCard = SysSpriteManager::getInstance().createButton(BUTTON_SELECTOR_WIDTH, BUTTON_SELECTOR_HEIGHT, BUTTON_LABEL_UP_CARD, this);
    _ButtonDownCard = SysSpriteManager::getInstance().createButton(BUTTON_SELECTOR_WIDTH, BUTTON_SELECTOR_HEIGHT, BUTTON_LABEL_DOWN_CARD, this);
    _ButtonUpDeck = SysSpriteManager::getInstance().createButton(BUTTON_SELECTOR_WIDTH, BUTTON_SELECTOR_HEIGHT, BUTTON_LABEL_UP_DECK, this);
    _ButtonDownDeck = SysSpriteManager::getInstance().createButton(BUTTON_SELECTOR_WIDTH, BUTTON_SELECTOR_HEIGHT, BUTTON_LABEL_DOWN_DECK, this);
    _ButtonWrite = SysSpriteManager::getInstance().createButton(BUTTON_WRITE_WIDTH, BUTTON_WRITE_HEIGHT, BUTTON_LABEL_WRITE, this);

    // ラベル初期化
    _LabelCard = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT);
    _LabelDeck = SysSpriteManager::getInstance().createSprite(LABEL_WIDTH, LABEL_HEIGHT);

    // コンテキスト初期化
    _CurrentCardIndex = 1;
    _CurrentDeckIndex = 0;
    _NeedToUpdateCard = true;
    _NeedToUpdateDeck = true;
}


void AppModeWriter::end()
{
    SysSpriteManager::getInstance().destroyDrawable(_ButtonWrite);
    SysSpriteManager::getInstance().destroyDrawable(_ButtonDownDeck);
    SysSpriteManager::getInstance().destroyDrawable(_ButtonUpDeck);
    SysSpriteManager::getInstance().destroyDrawable(_ButtonDownCard);
    SysSpriteManager::getInstance().destroyDrawable(_ButtonUpCard);
    delete _CardReader;
}


void AppModeWriter::update()
{
    _ButtonUpCard->update();
    _ButtonDownCard->update();
    _ButtonUpDeck->update();
    _ButtonDownDeck->update();
    _ButtonWrite->update();

    if(_NeedToUpdateCard)
    {
        static const char rank_letter[] = {'A','2','3','4','5','6','7','8','9','T','J','Q','K',};
        static const char suit_letter[] = {'s','h','d','c',};
        int rank_index = (_CurrentCardIndex - 1) % 13;
        int suit_index = (_CurrentCardIndex - 1) / 13;
        char buffer[4];
        buffer[0] = rank_letter[rank_index];
        buffer[1] = suit_letter[suit_index];
        buffer[2] = '\0';
        _LabelCard->clear();
        _LabelCard->drawText(0, 0, 4.0f, buffer);
        _NeedToUpdateCard = false;
    }
    if(_NeedToUpdateDeck)
    {
        char buffer[16];
        sprintf(buffer, "%d", _CurrentDeckIndex);
        _LabelDeck->clear();
        _LabelDeck->drawText(0, 0, 4.0f, buffer);
        _NeedToUpdateDeck = false;
    }
}


void AppModeWriter::draw()
{
    int display_width = SysDisplay::getInstance().getWidth();
    int display_height = SysDisplay::getInstance().getHeight();
    int right_selector_x = display_width - BUTTON_LAYOUT_OUTER_MARGIN - BUTTON_SELECTOR_WIDTH;
    int deck_selector_y = BUTTON_LAYOUT_OUTER_MARGIN + BUTTON_SELECTOR_HEIGHT + BUTTON_LAYOUT_INNER_MARGIN;
    int write_x = (display_width - BUTTON_WRITE_WIDTH) / 2;
    int write_y = display_height - BUTTON_LAYOUT_OUTER_MARGIN - BUTTON_WRITE_HEIGHT;
    int label_x = (display_width - LABEL_WIDTH) / 2;

    _ButtonUpCard->draw(BUTTON_LAYOUT_OUTER_MARGIN, BUTTON_LAYOUT_OUTER_MARGIN);
    _ButtonDownCard->draw(right_selector_x, BUTTON_LAYOUT_OUTER_MARGIN);
    _ButtonUpDeck->draw(BUTTON_LAYOUT_OUTER_MARGIN, deck_selector_y);
    _ButtonDownDeck->draw(right_selector_x, deck_selector_y);
    _ButtonWrite->draw(write_x, write_y);
    _LabelCard->draw(label_x, BUTTON_LAYOUT_OUTER_MARGIN+(BUTTON_SELECTOR_HEIGHT-LABEL_HEIGHT)/2);
    _LabelDeck->draw(label_x, deck_selector_y+(BUTTON_SELECTOR_HEIGHT-LABEL_HEIGHT)/2);
}


void AppModeWriter::onGUiButtonReleased(const char *label)
{
    if(strcmp(label, BUTTON_LABEL_UP_CARD) == 0)
    {
        _CurrentCardIndex--;
        if(_CurrentCardIndex < 1)
        {
            _CurrentCardIndex = 52;
        }
        _NeedToUpdateCard = true;
    }
    else if(strcmp(label, BUTTON_LABEL_DOWN_CARD) == 0)
    {
        _CurrentCardIndex++;
        if(_CurrentCardIndex > 52)
        {
            _CurrentCardIndex = 1;
        }
        _NeedToUpdateCard = true;
    }
    else if(strcmp(label, BUTTON_LABEL_UP_DECK) == 0)
    {
        _CurrentDeckIndex--;
        if(_CurrentDeckIndex < 0)
        {
            _CurrentDeckIndex = 10;
        }
        _NeedToUpdateDeck = true;
    }
    else if(strcmp(label, BUTTON_LABEL_DOWN_DECK) == 0)
    {
        _CurrentDeckIndex++;
        if(_CurrentDeckIndex > 10)
        {
            _CurrentDeckIndex = 0;
        }
        _NeedToUpdateDeck = true;
    }
    else if(strcmp(label, BUTTON_LABEL_WRITE) == 0)
    {
        uint8_t buffer[4];
        buffer[0] = _CurrentDeckIndex;
        buffer[1] = _CurrentCardIndex;
        buffer[2] = 0;
        buffer[3] = 0;
        if(_CardReader->write(4, buffer, sizeof(buffer), 500))
        {
            _CardReader->scan();
        }
        else
        {
            SysLog::printf(__NAMEOF__(AppModeWriter), "Write Failure.");
        }
    }
}
