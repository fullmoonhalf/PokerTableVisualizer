#include "SD.h"
#include <M5Unified.h>
#include "UhfRfidDriver.h"
#include "AppDisplay.h"
#include "AppCommandPanel.h"


static UhfRfidDriver _UhfRfidDriver;
static AppDisplay _Display;
static AppCommandPanel _CommandPanel(&_Display);
static LGFX_Sprite **_Sprites_Playcard_Collection;

static int counter = 0;


// -------------------------------------------------------------------------------------
// driver task
// -------------------------------------------------------------------------------------
void task_driver_process(void *param)
{
  _UhfRfidDriver.process();
}


// -------------------------------------------------------------------------------------
// commands.
// -------------------------------------------------------------------------------------
static int argument_value = 1;


static void test_inc()
{
  argument_value++;
  if(argument_value > 64)
  {
    argument_value = 64;
  }
}
static void test_dec()
{
  argument_value--;
  if(argument_value < 0)
  {
    argument_value = 0;
  }
}

static void test_commandSinglePollingInstruction()
{
  _UhfRfidDriver.commandSinglePollingInstruction();
}


static void test_reset_inventory_param()
{
  _UhfRfidDriver.resetInventoryParam();
}

static void test_get_informations()
{
  _UhfRfidDriver.commandInformation(UhfRfidInformationType::UhfRfidInformationType_Hardware);
  _UhfRfidDriver.commandInformation(UhfRfidInformationType::UhfRfidInformationType_Software);
  _UhfRfidDriver.commandInformation(UhfRfidInformationType::UhfRfidInformationType_Manufacturers);
  _UhfRfidDriver.commandGetTheSelectParameter();
  _UhfRfidDriver.commandGetParametersRelatedToTheQueryCommand();
}

static void test_write_epc_test()
{
  uint8_t stream[] = {0x30, 0x08, 0x33, 0xb2, 0xdd, 0xd9, 0x01, 0x40, 0xAA, 0x23, 0x01, argument_value, };
  _UhfRfidDriver.commandWriteTheLabelDataStore(0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_EPC, stream, sizeof(stream), 2);
}

static AppCommand _command_list[] = 
{
  { "Inc", test_inc, },
  { "Dec", test_dec, },

  { "SinglePoll", test_commandSinglePollingInstruction, },
  { "Write EPC", test_write_epc_test, },

  { "Get Info", test_get_informations, },
  { "Reset Prm", test_reset_inventory_param, },
};



// -------------------------------------------------------------------------------------
// setup
// -------------------------------------------------------------------------------------
void setup() 
{
  // System
  M5.begin();

  // Serial
  Serial.begin(115200);

  // LCD
  _Display.init();

  // UI セットアップ
  for(int index=0; index<__ARRAY_SIZE__(_command_list); ++index)
  {
    _CommandPanel.regist(_command_list + index);
  }

  _Sprites_Playcard_Collection = new LGFX_Sprite *[52];
  for(int index=0; index<52; ++index)
  {
    char filename[32];
    sprintf(filename, "/cards_m5-%d.jpg", index);
    Serial.println(filename);

    const char *suit_text[] = {"S","H","D","C"};
    const uint16_t suit_color[] ={TFT_WHITE, TFT_RED, TFT_CYAN, TFT_GREEN};
    int suit = index / 13;
    const char *rank_text[] = {"A","2","3","4","5","6","7","8","9","T","J","Q","K"};
    int rank = index % 13;

    auto sprite = new LGFX_Sprite( &_Display.Display );
    _Sprites_Playcard_Collection[index] = sprite;
    sprite->createSprite(16, 32);
    sprite->setColorDepth( _Display.Display.getColorDepth() );
    sprite->setFont(&fonts::Font2);
    sprite->setTextColor(suit_color[suit]);
    sprite->drawString(suit_text[suit], 5, 1);
    sprite->drawString(rank_text[rank], 5, 15);
    sprite->drawRect(0, 0, 16, 32, suit_color[suit]);
  }

  // カードリーダーセットアップ
  _UhfRfidDriver.setVerbose(true);
  _UhfRfidDriver.begin(&Serial2, 115200, 33, 32);
  _UhfRfidDriver.commandTxPower(2600, true);
  BaseType_t result = xTaskCreatePinnedToCore(task_driver_process, "t1", 4096, NULL, 1, NULL, 0);
}


// -------------------------------------------------------------------------------------
// main loop
// -------------------------------------------------------------------------------------
void loop() 
{
  M5.update();

  int touch_x = -1;
  int touch_y = -1;
  uint8_t touch_count = M5.Touch.getCount();
  if( touch_count > 0 )
  {
    auto touch_point = M5.Touch.getTouchPointRaw(0);
    touch_x = touch_point.x;
    touch_y = touch_point.y;
  }
  else
  {
    auto selected_command = _CommandPanel.getSelected();
    if(selected_command != nullptr)
    {
      selected_command->func();
      _CommandPanel.resetSelected();
    }
  }

  _CommandPanel.update(touch_x, touch_y);
  _CommandPanel.draw();
  _Sprites_Playcard_Collection[counter % 52]->pushSprite( 20, 165 );

  {
    char text[64];
    sprintf(text, "f:%d  c:%d  arg:%d", counter++, _UhfRfidDriver.getUpdateCount(), argument_value );
    M5.Lcd.drawString(text, 10, 10, 2);
  }
  delay(100);
}
