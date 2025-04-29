#include <M5Unified.h>
#include "SD.h"
#include "UhfRfidDriver.h"
#include "AppDisplay.h"
#include "SysSetting.h"
#include "AppSetting.h"
#include "AppModeDevelop.h"
#include "AppModeProbe.h"
#include "AppReporter.h"
#include "SysUtils.h"


static UhfRfidDriver _UhfRfidDriver;
static AppDisplay _Display;
static SysSetting _Setting;

static AppReporter *_Reporter;
static AppMode *_AppMode;



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
// setup
// -------------------------------------------------------------------------------------
void setup() 
{
  // System
  M5.begin();
  M5.Power.begin();
  Serial.begin(115200);

  // Settings
  _Setting.set(SETTING_KEY_MODE, "Develop");
  _Setting.set(SETTING_KEY_PROBE_NAME, "Seat01");
  _Setting.set(SETTING_KEY_PROBE_CARD_CAPACITY, "2");  
  _Setting.set(SETTING_KEY_BLE_IDENTIFIER, "PTV_PP_001");
  _Setting.set(SETTING_KEY_BLE_SERVICE_UUID, "cbaabb28-4e81-49c4-b775-aedfd27d8db0");
  _Setting.set(SETTING_KEY_BLE_CHARACTERISTICS_UUID, "45f116ee-b087-4271-888d-a15eebebd2eb");
  if(SD.begin(GPIO_NUM_4, SPI, 15000000))
  {
    Serial.println("SD initialize success.");
    _Setting.load();
  }
  else
  {
    Serial.println("SD initialize failure.");
  }

  // カードリーダーセットアップ
  _UhfRfidDriver.setVerbose(false);
  _UhfRfidDriver.begin(&Serial2, 115200, 33, 32);
  _UhfRfidDriver.commandTxPower(1000, true);

  // BLE まわり
  _Reporter = new AppReporter(
    _Setting.get(SETTING_KEY_BLE_IDENTIFIER).c_str(), 
    _Setting.get(SETTING_KEY_BLE_SERVICE_UUID).c_str(),
    _Setting.get(SETTING_KEY_BLE_CHARACTERISTICS_UUID).c_str()
  );
  _Reporter->setup();

  // LCD
  _Display.init();
  __DUMP_FL__

  // モードのセットアップ
  auto execute_mode = _Setting.get(SETTING_KEY_MODE);
  if(execute_mode == "Probe")
  {
    auto mode_probe = new AppModeProbe();
    mode_probe->init(
      &_UhfRfidDriver, 
      &_Display,
      _Reporter
    );
    _AppMode = mode_probe;
  }
  if(_AppMode == nullptr)
  {
    auto mode_develop = new AppModeDevelop();
    mode_develop->init(
      &_UhfRfidDriver, 
      &_Display,
      &_Setting, 
      _Reporter
    );
    _AppMode = mode_develop;
  }

  // スレッド
  start_process(task_rfid_driver_process, "t1", 4096, 1);
  start_process(task_reporter_driver_process, "t2", 4096, 2);
}


// -------------------------------------------------------------------------------------
// main loop
// -------------------------------------------------------------------------------------
void loop() 
{
  M5.update();
  _AppMode->update();
  _AppMode->draw();
  delay(100);
}
