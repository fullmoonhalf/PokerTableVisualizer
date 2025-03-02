#include "AppModeDevelop.h"
#include "SysUtils.h"

/// @brief 
/// @param argUhfRfidDriver 
/// @param argDisplay 
/// @param argSetting 
/// @param identifier 
/// @param service_uuid 
/// @param characteristics_uuid 
void AppModeDevelop::init(UhfRfidDriver *argUhfRfidDriver, AppDisplay *argDisplay, SysSetting *argSetting, AppReporter *argReporter)
{
    _Context._RefUhfRfidDriver = argUhfRfidDriver;
    _Context._RefDisplay = argDisplay;
    _Context._RefSetting = argSetting;
    _Context._RefReporter = argReporter;

    _Context._CardReader = new AppCardReader();
    _Context._RefUhfRfidDriver->regist(_Context._CardReader, UhfRfidCommand::UhfRfidCommand_SinglePollingInstruction);
    _Context._RefReporter->bind(_Context._CardReader);

    // UI セットアップ
    _Context._CommandPanel = new AppCommandPanel(_Context._RefDisplay);
    _Context._CommandPanel->regist(new AppModeDevelop_Command_StartPolling(_Context));
    _Context._CommandPanel->regist(new AppModeDevelop_Command_StopPolling(_Context));
    _Context._CommandPanel->regist(new AppModeDevelop_Command_ResetCardReader(_Context));
#if 0
    _Context._CommandPanel->regist(new AppModeDevelop_Command_EpcTest(_Context));
    _Context._CommandPanel->regist(new AppModeDevelop_Command_Inc(_Context));
    _Context._CommandPanel->regist(new AppModeDevelop_Command_Dec(_Context));
    _Context._CommandPanel->regist(new AppModeDevelop_Command_GetInformations(_Context));
    _Context._CommandPanel->regist(new AppModeDevelop_Command_ResetInventoryParam(_Context));
#endif

    _Context._Playcards = new AppPlaycardSprites(_Context._RefDisplay);
    _Context._Playcards->init();

    _Context._StatusPanel = new AppStatusPanel(_Context._RefDisplay);
    _Context._StatusPanel->setup();
    _Context._StatusPanel->bind(_Context._RefUhfRfidDriver);
    _Context._StatusPanel->bind(_Context._RefReporter);
    _Context._StatusPanel->bind(_Context._RefSetting);
    _Context._StatusPanel->dumpMemoryStatus();
}


/// @brief 
void AppModeDevelop::update()
{
    _Context.counter++;

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
        auto selected_command = _Context._CommandPanel->getSelected();
        if(selected_command != nullptr)
        {
            selected_command->execute();
            _Context._CommandPanel->resetSelected();
        }
    }

    if(_Context.polling_enable)
    {
        if(_Context.counter % 5)
        {
            _Context._RefUhfRfidDriver->commandSinglePollingInstruction();
        }
    }

    _Context._CommandPanel->update(touch_x, touch_y);
    _Context._StatusPanel->update();
    _Context._RefReporter->update();
}


/// @brief 描画処理
void AppModeDevelop::draw()
{
    _Context._CommandPanel->draw();
    _Context._CardReader->draw(_Context._Playcards);
    _Context._StatusPanel->draw(10, 10);
}


void AppModeDevelop_Command_Inc::execute()
{
    _Context.argument_value++;
    if(_Context.argument_value > 64)
    {
        _Context.argument_value = 64;
    }
}


void AppModeDevelop_Command_Dec::execute()
{
    _Context.argument_value--;
    if(_Context.argument_value < 0)
    {
        _Context.argument_value = 0;
    }
}


void AppModeDevelop_Command_StartPolling::execute()
{
    _Context.polling_enable = true;
}


void AppModeDevelop_Command_StopPolling::execute()
{
    _Context.polling_enable = false;
}


void AppModeDevelop_Command_ResetInventoryParam::execute()
{
    _Context._RefUhfRfidDriver->resetInventoryParam();
}


void AppModeDevelop_Command_GetInformations::execute()
{
    _Context._RefUhfRfidDriver->commandInformation(UhfRfidInformationType::UhfRfidInformationType_Hardware);
    _Context._RefUhfRfidDriver->commandInformation(UhfRfidInformationType::UhfRfidInformationType_Software);
    _Context._RefUhfRfidDriver->commandInformation(UhfRfidInformationType::UhfRfidInformationType_Manufacturers);
    _Context._RefUhfRfidDriver->commandGetTheSelectParameter();
    _Context._RefUhfRfidDriver->commandGetParametersRelatedToTheQueryCommand();
}


void AppModeDevelop_Command_EpcTest::execute()
{
    uint8_t stream[] = {0x30, 0x08, 0x33, 0xb2, 0xdd, 0xd9, 0x01, 0x40, 0xAA, 0x23, 0x01, _Context.argument_value, };
    _Context._RefUhfRfidDriver->commandWriteTheLabelDataStore(0, UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_EPC, stream, sizeof(stream), 2);
}


void AppModeDevelop_Command_ResetCardReader::execute()
{
    _Context._CardReader->reset();
}
