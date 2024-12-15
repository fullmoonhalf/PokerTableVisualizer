#include "UhfRfidDriver.h"


/// @brief 送信: 23. Set the transmitting power
/// @param power db(x100) ex. 2600 = 26db
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandTxPower(uint16_t power, bool immidiately)
{
    uint8_t command_param[2];
    command_param[0] = (power >> 8) & 0xff;
    command_param[1] = power & 0xff;
    return _send(UhfRfidCommand::UhfRfidCommand_SetTheTransmittingPower, command_param, sizeof(command_param), immidiately);
}


/// @brief 0. Hardware version or 1. Software version or 2. Manufacturers
/// @param what 0: hardware / 1: software / 2: manifactures
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandInformation(uint8_t what, bool immidiately)
{
    uint8_t command_param[1];
    command_param[0] = what;
    return _send(UhfRfidCommand::UhfRfidCommand_Information, command_param, sizeof(command_param), immidiately);
}


/// @brief 3. Single polling instruction
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandSinglePollingInstruction(bool immidiately)
{
    /*
        EPCClass1Gen2 プロトコルでインベントリのポーリング操作を完了します。 
        Select 操作は、このディレクティブに含まれていません。
        アンプは、各ポーリング命令が実行される前と後に自動的にオン/オフされます。 
        Inventory コマンドの 1 回のポーリングでは、Query operation パラメータは別のコマンドによって設定され、初期値はすでにファームウェアに含まれています。 
        次のコマンドは、1 ラウンドでインベントリをポーリングするコマンドです。

        1回のポーリング命令を受け取った後、チップがCRC検証のために正しいラベルを読み取ることができれば、チップMCUはRSSI、PC、EPC、およびCRCを含むデータを返します。 
        EPC がタグを読み取るときは 1 つのコマンド応答を返し、複数のタグを読み取るときは複数のコマンド応答を返します。 

        RSSI 値はチップ入力の信号サイズを反映しており、アンテナ・ゲインと指向性カプラの減衰は含まれていません。
        RSSIはチップの入力での信号強度であり、16進数の符号付き数値はdBmで測定されます。

        ラベルが返されない場合、または返されたデータ CRC 検証エラーが正しくない場合は、エラー コード 0x15 が返されます。
    */
    return _send(UhfRfidCommand::UhfRfidCommand_SinglePollingInstruction, nullptr, 0, immidiately);
}


/// @brief 4. Multiple polling instructions
/// @param count 
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandMultiPollingInstruction(uint16_t count, bool immidiately)
{
    uint8_t command_param[3];
    command_param[0] = 0x22; // reserved number.
    command_param[1] = (count >> 8) & 0xff;
    command_param[2] = count & 0xff;
    return _send(UhfRfidCommand::UhfRfidCommand_Information, command_param, sizeof(command_param), immidiately);
}


/// @brief 7. Get the SELECT parameter
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandGetTheSelectParameter(bool immidiately)
{
    return _send(UhfRfidCommand::UhfRfidCommand_GetTheSelectParameter, nullptr, 0, immidiately);
}



bool UhfRfidDriver::commandSetTheSelectParameterInstruction(bool immidiately)
{
    uint8_t command_param[0x13];
    command_param[0] = 0x22; // reserved number.
    return _send(UhfRfidCommand::UhfRfidCommand_Information, command_param, sizeof(command_param), immidiately);

}
