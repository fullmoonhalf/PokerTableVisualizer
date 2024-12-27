#include <M5Core2.h>


#if 1
#include "UhfRfidDriver.h"

static UhfRfidDriver _UhfRfidDriver;
static int counter = 0;


// -------------------------------------------------------------------------------------
// driver task
// -------------------------------------------------------------------------------------
void task_driver_process(void *param)
{
  __DUMP_FL__
  _UhfRfidDriver.process();
  __DUMP_FL__
}


// -------------------------------------------------------------------------------------
// setup
// -------------------------------------------------------------------------------------
void setup() 
{
  M5.begin();
  Serial.begin(115200);
  M5.Lcd.fillScreen(BLACK);

  _UhfRfidDriver.setVerbose(true);
  _UhfRfidDriver.begin(&Serial2, 115200, 33, 32);
  _UhfRfidDriver.commandTxPower(2600, true);
  _UhfRfidDriver.commandInformation(0);
  _UhfRfidDriver.commandInformation(1);
  _UhfRfidDriver.commandInformation(2);
  BaseType_t result = xTaskCreatePinnedToCore(task_driver_process, "t1", 4096, NULL, 1, NULL, 0);

}


// -------------------------------------------------------------------------------------
// main loop
// -------------------------------------------------------------------------------------
static void test_commandSinglePollingInstruction()
{
  _UhfRfidDriver.commandSinglePollingInstruction();
}

static void test_commandGetTheSelectParameter()
{
  _UhfRfidDriver.commandGetTheSelectParameter();
}

static void test_commandReadLabelDataStorageArea()
{
  _UhfRfidDriver.commandReadLabelDataStorageArea(
    0x0, 
    UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_RFU,
    0, 
    2
  );
}

static void test_commandSetTheSelectParameterInstruction_Reset()
{
  _UhfRfidDriver.commandSetTheSelectParameterInstruction(
    UhfRfidSelectSelParamTarget::UhfRfidSelectSelParamTarget_Inventoried_1,
    UhfRfidSelectSelParamAction::UhfRfidSelectSelParamAction_0,
    UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_EPC, 
    0,
    0,
    nullptr,
    false
  );
}



struct Command
{
  const char *name;
  void (*func)();
};
static Command _command_list[] = 
{
  { "SinglePolling        ", test_commandSinglePollingInstruction, },
  { "GetSelect            ", test_commandGetTheSelectParameter, },
  { "Reset Select         ", test_commandSetTheSelectParameterInstruction_Reset},
  { "ReadLabel            ", test_commandReadLabelDataStorageArea, },
};
static int _command_index = 0;




void loop() 
{
  M5.update();

  if(M5.BtnA.wasPressed())
  {
    _command_list[_command_index].func();
  }
  else if(M5.BtnB.wasPressed())
  {
    _command_index--;
    if(_command_index < 0)
    {
      _command_index = __ARRAY_SIZE__(_command_list);
    }
  }
  else if(M5.BtnC.wasPressed())
  {
    _command_index++;
    if(_command_index >= __ARRAY_SIZE__(_command_list))
    {
      _command_index = 0;
    }
  }

  M5.Lcd.drawNumber(counter++, 20, 20, 4);
  M5.Lcd.drawNumber(_UhfRfidDriver.getUpdateCount(), 20, 40, 4);
  M5.Lcd.drawString(_command_list[_command_index].name, 20, 60, 4);

  delay(100);
}





#endif


#if 0

#include "UNIT_UHF_RFID.h"

Unit_UHF_RFID uhf;

String info = "";
int counter = 0;


// -------------------------------------------------------------------------------------
// Card Selector
// -------------------------------------------------------------------------------------
#define DECK_IDENTIFY_ID_LEN (4)
#define DECK_IDENTIFY_MEMBANK (0)

struct DeckCard
{
  String Name;
  uint8_t Identifier[DECK_IDENTIFY_ID_LEN];
};

DeckCard DeckCardList[] = 
{
  { "As", {0x00, 0x01, 0x00, 0x01}, },
  { "2s", {0x01, 0x01, 0x00, 0x02}, },
  { "3s", {0x02, 0x01, 0x00, 0x03}, },
  { "4s", {0x03, 0x01, 0x00, 0x04}, },
  { "5s", {0x04, 0x01, 0x00, 0x05}, },
  { "6s", {0x05, 0x01, 0x00, 0x06}, },
  { "7s", {0x06, 0x01, 0x00, 0x07}, },
  { "8s", {0x07, 0x01, 0x00, 0x08}, },
  { "9s", {0x08, 0x01, 0x00, 0x09}, },
  { "Ts", {0x09, 0x01, 0x00, 0x0a}, },
  { "Js", {0x0a, 0x01, 0x00, 0x0b}, },
  { "Qs", {0x0b, 0x01, 0x00, 0x0c}, },
  { "Ks", {0x0c, 0x01, 0x00, 0x0d}, },
  { "Ah", {0x0d, 0x02, 0x00, 0x01}, },
  { "2h", {0x0e, 0x02, 0x00, 0x02}, },
  { "3h", {0x0f, 0x02, 0x00, 0x03}, },
  { "4h", {0x10, 0x02, 0x00, 0x04}, },
  { "5h", {0x11, 0x02, 0x00, 0x05}, },
  { "6h", {0x12, 0x02, 0x00, 0x06}, },
  { "7h", {0x13, 0x02, 0x00, 0x07}, },
  { "8h", {0x14, 0x02, 0x00, 0x08}, },
  { "9h", {0x15, 0x02, 0x00, 0x09}, },
  { "Th", {0x16, 0x02, 0x00, 0x0a}, },
  { "Jh", {0x17, 0x02, 0x00, 0x0b}, },
  { "Qh", {0x18, 0x02, 0x00, 0x0c}, },
  { "Kh", {0x19, 0x02, 0x00, 0x0d}, },
  { "Ad", {0x1a, 0x03, 0x00, 0x01}, },
  { "2d", {0x1b, 0x03, 0x00, 0x02}, },
  { "3d", {0x1c, 0x03, 0x00, 0x03}, },
  { "4d", {0x1d, 0x03, 0x00, 0x04}, },
  { "5d", {0x1e, 0x03, 0x00, 0x05}, },
  { "6d", {0x1f, 0x03, 0x00, 0x06}, },
  { "7d", {0x20, 0x03, 0x00, 0x07}, },
  { "8d", {0x21, 0x03, 0x00, 0x08}, },
  { "9d", {0x22, 0x03, 0x00, 0x09}, },
  { "Td", {0x23, 0x03, 0x00, 0x0a}, },
  { "Jd", {0x24, 0x03, 0x00, 0x0b}, },
  { "Qd", {0x25, 0x03, 0x00, 0x0c}, },
  { "Kd", {0x26, 0x03, 0x00, 0x0d}, },
  { "Ac", {0x27, 0x04, 0x00, 0x01}, },
  { "2c", {0x28, 0x04, 0x00, 0x02}, },
  { "3c", {0x29, 0x04, 0x00, 0x03}, },
  { "4c", {0x2a, 0x04, 0x00, 0x04}, },
  { "5c", {0x2b, 0x04, 0x00, 0x05}, },
  { "6c", {0x2c, 0x04, 0x00, 0x06}, },
  { "7c", {0x2d, 0x04, 0x00, 0x07}, },
  { "8c", {0x2e, 0x04, 0x00, 0x08}, },
  { "9c", {0x2f, 0x04, 0x00, 0x09}, },
  { "Tc", {0x30, 0x04, 0x00, 0x0a}, },
  { "Jc", {0x31, 0x04, 0x00, 0x0b}, },
  { "Qc", {0x32, 0x04, 0x00, 0x0c}, },
  { "Kc", {0x33, 0x04, 0x00, 0x0d}, },
};

int CurrentSelectCard = 0;


// -------------------------------------------------------------------------------------
// Reader
// -------------------------------------------------------------------------------------
uint8_t read_buffer[32] = {0};
uint8_t size[] = {14, 14, 4, 14, 14, 14, 4, 14};


void read()
{
  uint8_t polling_count = uhf.pollingOnce();
  if(polling_count > 0)
  {
    char line[128];
    char *seek = line;
    seek += sprintf(seek, "Scan: ");
    if (uhf.readCard(read_buffer, DECK_IDENTIFY_ID_LEN, DECK_IDENTIFY_MEMBANK, 0, 0x00000000))
    {
      for(int index=0; index<DECK_IDENTIFY_ID_LEN; ++index)
      {
        seek += sprintf(seek, "%02x ", read_buffer[index]);
        M5.lcd.fillRect(60, 100, 180, 20, BLACK);
        M5.lcd.drawString(line, 60, 100, 4);
      }

      uint8_t deck_index = read_buffer[0];
      if(deck_index < 52)
      {
        for(int index=0; index<DECK_IDENTIFY_ID_LEN; ++index)
        {
          if(DeckCardList[deck_index].Identifier[index] != read_buffer[index])
          {
            deck_index = 0xff;
            break;
          }
        }
      }
      if(deck_index < 52)
      {
        M5.lcd.fillRect(60, 120, 180, 20, BLACK);
        M5.lcd.drawString("Read: " + DeckCardList[deck_index].Name, 60, 120, 4);
      }
      else
      {
        M5.lcd.fillRect(60, 120, 180, 20, BLACK);
        M5.lcd.drawString("Read: ????", 60, 120, 4);
      }
    }
  }
}



// -------------------------------------------------------------------------------------
// Writer
// -------------------------------------------------------------------------------------
void write()
{
  uint8_t polling_count = uhf.pollingOnce();
  if(polling_count > 0)
  {
    char line[128];
    if (uhf.writeCard(DeckCardList[CurrentSelectCard].Identifier, DECK_IDENTIFY_ID_LEN, DECK_IDENTIFY_MEMBANK, 0, 0x00000000))
    {
      sprintf(line, "Write %s OK (%d)", DeckCardList[CurrentSelectCard].Name, counter);
      M5.lcd.fillRect(60, 180, 180, 20, BLACK);
      M5.lcd.drawString(line, 60, 180, 4);
    } 
    else 
    {
      M5.lcd.fillRect(60, 180, 180, 20, BLACK);
      sprintf(line, "Write %s NG (%d)", DeckCardList[CurrentSelectCard].Name, counter);
      return;
    }

    delay(1000);

    read();
  }
}


// -------------------------------------------------------------------------------------
// Mode Management
// -------------------------------------------------------------------------------------
enum Mode
{
  ModeRead,
  ModeWrite,
};
Mode CurrentMode = Mode::ModeRead;


// -------------------------------------------------------------------------------------
// setup
// -------------------------------------------------------------------------------------
void setup() 
{
  M5.begin();  // Init M5Core.  初始化 M5Core
  M5.Lcd.fillScreen(BLACK);

  // Serial2.begin(unsigned long baud, uint32_t config, int8_t rxPin, int8_t
  // txPin, bool invert) uhf.begin(HardwareSerial *serial = &Serial2, int
  // baud=115200, uint8_t RX = 16, uint8_t TX = 17, bool debug = false);
  uhf.begin(&Serial2, 115200, 33, 32, false);
  int count = 0;
  while (1) {
    M5.Lcd.drawNumber(count++, 60, 20, 4);
      info = uhf.getVersion();
      if (info != "ERROR") {
          Serial.println(info);
          break;
      }
  }

  // max: 26dB
  uhf.setTxPower(2600);
}


// -------------------------------------------------------------------------------------
// main loop
// -------------------------------------------------------------------------------------
void loop() 
{
  M5.update();

  if(M5.BtnA.wasPressed())
  {
    switch(CurrentMode)
    {
      case Mode::ModeRead:
        CurrentMode = Mode::ModeWrite;
        break;
      case Mode::ModeWrite:
        CurrentMode = Mode::ModeRead;
        break;
    }
  }
  if(M5.BtnB.wasPressed())
  {
    CurrentSelectCard--;
    if(CurrentSelectCard < 0)
    {
      CurrentSelectCard = 51;
    }
  }
  if(M5.BtnC.wasPressed())
  {
    CurrentSelectCard++;
    if(CurrentSelectCard >= 52)
    {
      CurrentSelectCard = 0;
    }
  }

//  write();
//  backup();

  char line[128];
  //M5.Lcd.fillScreen(BLACK);
  M5.Lcd.drawNumber(counter++, 60, 20, 4);
  {
    sprintf(line, "Mode: %d",(int)CurrentMode);
    M5.lcd.drawString(line, 60, 40, 4);
  }
  {
    sprintf(line, "Set: %s",DeckCardList[CurrentSelectCard].Name.c_str());
    M5.lcd.fillRect(60, 60, 120, 20, BLACK);
    M5.lcd.drawString(line, 60, 60, 4);
  }

  switch(CurrentMode)
  {
    case Mode::ModeRead:
      read();
      break;
    case Mode::ModeWrite:
      write();
      CurrentMode = Mode::ModeRead;
      break;
  }

  delay(100);
}


// -------------------------------------------------------------------------------------
// trush
// -------------------------------------------------------------------------------------
void trush()
{
  uint8_t polling_count = uhf.pollingOnce();
  if(polling_count > 0)
  {
    for(int index=0; index<polling_count; ++index)
    {
      CARD *card = uhf.cards + index;
      Serial.printf("[%d] rssi %s pc %s rpc %s", index, card->rssi_str.c_str(), card->pc_str.c_str(), card->epc_str.c_str());
      Serial.println();
    }
    if(uhf.select(uhf.cards[0].epc))
    {
      Serial.println("Current Select EPC:" + uhf.selectInfo());
    }
    for(uint8_t membank = 0; membank < 8; ++membank)
    {
      Serial.printf("bank %02x: ", membank);
      if (uhf.readCard(read_buffer, size[membank], membank, 0, 0x00000000))
      {
        for(int index=0; index<size[membank]; ++index)
        {
          Serial.printf("%02x ", read_buffer[index]);
        }
        Serial.println("");
      }
      else
      {
        Serial.println("read fail.");
      }
    }
    Serial.println();
  }
}


#endif
