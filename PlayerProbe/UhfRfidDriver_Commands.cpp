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
