#include <M5Unified.h>
#include "UhfRfidDriver.h"
#include "AppDisplay.h"
#include "AppCommandPanel.h"
#include "AppPlaycardSprites.h"
#include "AppStatusPanel.h"
#include "AppCardReader.h"
#include "AppReporter.h"


static UhfRfidDriver _UhfRfidDriver;
static AppDisplay _Display;
static AppCardReader _CardReader;
static AppReporter *_Reporter = nullptr;

// Interface.
static AppCommandPanel _CommandPanel(&_Display);
static AppPlaycardSprites _Playcards(&_Display);
static AppStatusPanel _StatusPanel(&_Display);

static int counter = 0;


// -------------------------------------------------------------------------------------
// driver task
// -------------------------------------------------------------------------------------
static void task_rfid_driver_process(void *param)
{
  _UhfRfidDriver.process();
}

static void task_reporter_driver_process(void *param)
{
  _Reporter->process();
}

static void start_process(void (*func)(void *), const char *name, int stack, int prio)
{
  auto result = xTaskCreatePinnedToCore(func, name, stack, NULL, prio, NULL, 0);
  Serial.printf("start process %s stack %d prio %d: result %d\r\n", name, stack, prio, result);
}


// -------------------------------------------------------------------------------------
// commands.
// -------------------------------------------------------------------------------------
static int argument_value = 1;
static bool polling_enable = false;


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

static void test_start_polling()
{
    polling_enable = true;
}

static void test_stop_polling()
{
    polling_enable = false;
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

static void test_reset_cardreader()
{
  _CardReader.reset();
}

static AppCommand _command_list[] = 
{
  { "Start", test_start_polling, },
  { "Stop", test_stop_polling, },
  { "ResetRead", test_reset_cardreader, },

#if 0
  { "Write EPC", test_write_epc_test, },
  { "Inc", test_inc, },
  { "Dec", test_dec, },
  { "Get Info", test_get_informations, },
  { "Reset Prm", test_reset_inventory_param, },
#endif
};



// -------------------------------------------------------------------------------------
// setup
// -------------------------------------------------------------------------------------
GuiGauge *_TestGauge = nullptr;


void setup() 
{
  // System
  M5.begin();
  M5.Power.begin();

  // LCD
  _Display.init();

  // Serial
  Serial.begin(115200);

  // Reporter
  _Reporter = new AppReporter("PTV_PP_001", "cbaabb28-4e81-49c4-b775-aedfd27d8db0", "45f116ee-b087-4271-888d-a15eebebd2eb", &_CardReader);
  _Reporter->setup();

  // UI セットアップ
  for(int index=0; index<__ARRAY_SIZE__(_command_list); ++index)
  {
    _CommandPanel.regist(_command_list + index);
  }
  _Playcards.init();
  _StatusPanel.setup();
  _TestGauge = new GuiGauge(&_Display.Display, 0, 30, 20, 4);

  // カードリーダーセットアップ
  _UhfRfidDriver.setVerbose(false);
  _UhfRfidDriver.begin(&Serial2, 115200, 33, 32);
  _UhfRfidDriver.regist(&_CardReader, UhfRfidCommand::UhfRfidCommand_SinglePollingInstruction);
  _UhfRfidDriver.commandTxPower(2600, true);

  // 紐付け
  _StatusPanel.bind(&_UhfRfidDriver);
  _StatusPanel.bind(_Reporter);

  // スレッド
  start_process(task_rfid_driver_process, "t1", 4096, 1);
  start_process(task_reporter_driver_process, "t2", 4096, 2);

  _StatusPanel.dumpMemoryStatus();
}


// -------------------------------------------------------------------------------------
// main loop
// -------------------------------------------------------------------------------------
/// @brief 更新処理
static void application_update()
{
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
  if(polling_enable)
  {
    if(counter % 5)
    {
      _UhfRfidDriver.commandSinglePollingInstruction();
    }
  }

  _CommandPanel.update(touch_x, touch_y);
  _StatusPanel.update();
  _Reporter->update();

  _TestGauge->setCurrentValue(counter % 30);
  _TestGauge->update();
}


/// @brief 描画処理
static void applicatoin_draw()
{
  _CommandPanel.draw();
  _CardReader.draw(&_Playcards);
  _StatusPanel.draw(10, 10);
  _TestGauge->draw(200, 10);
}


void loop() 
{
  ++counter;

  M5.update();
  application_update();
  applicatoin_draw();

  delay(100);
}
