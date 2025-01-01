#include "SD.h"
#include <M5Unified.h>
#include "UhfRfidDriver.h"

static UhfRfidDriver _UhfRfidDriver;

static M5GFX _Display;

static LGFX_Sprite **_Sprites_Command_Collection;
static int _Sprites_Command_Count;
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

static void test_read_rfu()
{
  // max 7 word.
  _UhfRfidDriver.commandReadLabelDataStorageArea(0x0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_RFU, 0, argument_value);
}
static void test_read_epc()
{
  // max 10 word.
  _UhfRfidDriver.commandReadLabelDataStorageArea(0x0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_EPC, 0, argument_value);
}
static void test_read_tid()
{
  // max 12 word.
  _UhfRfidDriver.commandReadLabelDataStorageArea(0x0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_TID, 0, argument_value);
}
static void test_read_user()
{
  // max 16+ word.
  _UhfRfidDriver.commandReadLabelDataStorageArea(0x0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_User, 0, 8);
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

static void test_unlock_epc_test()
{
  UhfRfidLockOperation operations[] = {
    {UhfRfidLockMemoryTargetType::UhfRfidLockTargetType_EPCMemory, UhfRfidLockActionTargetType::UhfRfidLockTargetType_Permalock, false, },
    {UhfRfidLockMemoryTargetType::UhfRfidLockTargetType_EPCMemory, UhfRfidLockActionTargetType::UhfRfidLockTargetType_PasswordWrite, false, },
  };
  _UhfRfidDriver.commandLockTheLOCKLabelDataStore(0, operations, __ARRAY_SIZE__(operations));
}

static void test_scan()
{
  uint8_t stream[] = {0xAA, 0x23, 0xAA, 0xFF, 0x00, 0x00, 0x00, 0x00, };

  _UhfRfidDriver.commandSetTheQueryParameter(
    UhfRfidQueryParamDRType::UhfRfidQueryParamDRType_8,
    UhfRfidQueryParamMType::UhfRfidQueryParamMType_1,
    UhfRfidQueryParamTRextType::UhfRfidQueryParamTRextType_UsePilotTone,
    UhfRfidQueryParamSelType::UhfRfidQueryParamSelType_ALL,
    UhfRfidQueryParamSessionType::UhfRfidQueryParamSessionType_S2,
    UhfRfidQueryParamTargetType::UhfRfidQueryParamTargetType_A,
    4
  );
  stream[0x3] = 1;
  _UhfRfidDriver.commandSetTheSelectParameterInstruction(
    UhfRfidSelectSelParamTarget::UhfRfidSelectSelParamTarget_Inventoried_3,
    UhfRfidSelectSelParamAction::UhfRfidSelectSelParamAction_0,
    UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_User,
    0,
    32,
    stream,
    false
  );
  
  _UhfRfidDriver.commandSinglePollingInstruction();
  _UhfRfidDriver.commandReadLabelDataStorageArea(0x0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_User, 0, 8);
}

static void test_scan2()
{
//  uint8_t stream[] = {0x30, 0x08, };
  uint8_t stream[] = {0xAA, 0x23, 0xAA, 0x01, 0x00, 0x00, 0x00, 0x00, };
  _UhfRfidDriver.commandSetTheQueryParameter(
    UhfRfidQueryParamDRType::UhfRfidQueryParamDRType_8,
    UhfRfidQueryParamMType::UhfRfidQueryParamMType_1,
    UhfRfidQueryParamTRextType::UhfRfidQueryParamTRextType_UsePilotTone,
    UhfRfidQueryParamSelType::UhfRfidQueryParamSelType_ALL,
    UhfRfidQueryParamSessionType::UhfRfidQueryParamSessionType_S2,
    UhfRfidQueryParamTargetType::UhfRfidQueryParamTargetType_A,
    4
  );
  _UhfRfidDriver.commandSetTheSelectParameterInstruction(
    UhfRfidSelectSelParamTarget::UhfRfidSelectSelParamTarget_Inventoried_3,
    UhfRfidSelectSelParamAction::UhfRfidSelectSelParamAction_0,
    UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_User,
    0,
    32,
    stream,
    false
  );

  _UhfRfidDriver.commandSinglePollingInstruction();
  _UhfRfidDriver.commandReadLabelDataStorageArea(0x0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_User, 0, 8);
}





static void test_write_user_test()
{
  uint8_t stream[] = {0xAA, 0x23, 0xAA, 0xFF, 0x00, 0x00, 0x00, 0x00, };
  stream[0x3] = argument_value; // deck
  stream[0x4] = 1; // index
  stream[0x5] = 1; // suit
  stream[0x6] = 1; // rank
  _UhfRfidDriver.commandWriteTheLabelDataStore(0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_User, stream, sizeof(stream), 0);
}


struct Command
{
  const char *name;
  void (*func)();
};
static Command _command_list[] = 
{
  { "Inc", test_inc, },
  { "Dec", test_dec, },

  { "SinglePoll", test_commandSinglePollingInstruction, },
  { "Write EPC", test_write_epc_test, },

  { "Get Info", test_get_informations, },
  { "Reset Prm", test_reset_inventory_param, },

//  { "Read User                 ", test_read_user, },
//  { "Read RFU                  ", test_read_rfu, },
//  { "Read TID                  ", test_read_tid, },
//  { "Read EPC                  ", test_read_epc, },
//  { "Write User                 ", test_write_user_test, },
//  { "Test Scan                 ", test_scan, },
//  { "Test Scan 2                ", test_scan2, },
//  { "Unlock EPC                 ", test_unlock_epc_test, },
};


static void draw_command_panel(bool renew, int active_index)
{
  const int width = 70;
  const int height = 60;
  const int col_max = 4;
  const int offset_x = 20;
  const int offset_y = 40;

  if(renew)
  {
    for(int index=0; index<__ARRAY_SIZE__(_command_list); ++index)
    {
      auto sprite = _Sprites_Command_Collection[index];
      if(index == active_index)
      {
        sprite->fillSprite(TFT_DARKCYAN);
      }
      else
      {
        sprite->fillSprite(TFT_BLACK);
        sprite->drawRect(0, 0, 70, 60, TFT_WHITE);
      }
      sprite->drawString(_command_list[index].name, 3, 20);
    }
  }

  // 描画
  for(int index=0; index<__ARRAY_SIZE__(_command_list); ++index)
  {
    int x = (index % col_max) * width + offset_x;
    int y = (index / col_max) * height + offset_y;
    auto sprite = _Sprites_Command_Collection[index];
    sprite->pushSprite(x, y);
  }
}


static int update_command_panel(int touchX, int touchY)
{
  const int width = 70;
  const int height = 60;
  const int col_max = 4;
  const int offset_x = 20;
  const int offset_y = 40;

  int touch_x_index = (touchX - offset_x) / width;
  int touch_y_index = (touchY - offset_y) / height;
  int selected_index = -1;
  if(touchX >= 0 && touchY >= 0 && touch_x_index >= 0 && touch_x_index < col_max && touch_y_index >= 0)
  {
    int touch_index = touch_x_index + touch_y_index * col_max;
    if(touch_index <__ARRAY_SIZE__(_command_list))
    {
      selected_index = touch_index;
    }
  }
  return selected_index;
}


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
  _Display.begin();
  _Display.fillScreen(TFT_BLACK);

  // UI セットアップ
  _Sprites_Command_Count = __ARRAY_SIZE__(_command_list);
  _Sprites_Command_Collection = new LGFX_Sprite *[_Sprites_Command_Count];
  for(int index=0; index<__ARRAY_SIZE__(_command_list); ++index)
  {
    auto sprite = new LGFX_Sprite( &_Display );
    _Sprites_Command_Collection[index] = sprite;
    sprite->createSprite(70, 60);
    sprite->setColorDepth( _Display.getColorDepth() );
    sprite->setFont(&fonts::Font2);
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

    auto sprite = new LGFX_Sprite( &_Display );
    _Sprites_Playcard_Collection[index] = sprite;
    sprite->createSprite(16, 32);
    sprite->setColorDepth( _Display.getColorDepth() );
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
static int _last_active_command = -2;

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
    if(_last_active_command >= 0)
    {
      _command_list[_last_active_command].func();
      _last_active_command = -2;
    }
  }

  int selected_index = update_command_panel(touch_x, touch_y);
  bool renew = selected_index != _last_active_command;
  _last_active_command = selected_index;
  draw_command_panel(renew, selected_index);
  _Sprites_Playcard_Collection[counter % 52]->pushSprite( 20, 165 );

  {
    char text[64];
    sprintf(text, "f:%d  c:%d  arg:%d", counter++, _UhfRfidDriver.getUpdateCount(), argument_value );
    M5.Lcd.drawString(text, 10, 10, 2);
  }
  delay(100);
}
