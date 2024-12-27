#include "UhfRfidDriver.h"



bool UhfRfidDriver::resetInventoryParam()
{
  commandSetTheSelectParameterInstruction(
    UhfRfidSelectSelParamTarget::UhfRfidSelectSelParamTarget_Inventoried_1,
    UhfRfidSelectSelParamAction::UhfRfidSelectSelParamAction_0,
    UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_EPC, 
    0,
    0,
    nullptr,
    false
  );
  commandSetTheQueryParameter(
    UhfRfidQueryParamDRType::UhfRfidQueryParamDRType_8,
    UhfRfidQueryParamMType::UhfRfidQueryParamMType_1,
    UhfRfidQueryParamTRextType::UhfRfidQueryParamTRextType_UsePilotTone,
    UhfRfidQueryParamSelType::UhfRfidQueryParamSelType_ALL,
    UhfRfidQueryParamSessionType::UhfRfidQueryParamSessionType_S0,
    UhfRfidQueryParamTargetType::UhfRfidQueryParamTargetType_A,
    4
  );

  commandGetTheSelectParameter();
  commandGetParametersRelatedToTheQueryCommand();

  return true;
}


/// @brief 
/// @param output 
/// @param input 
/// @return 
int UhfRfidDriver::_write_uint32_to_stream(uint8_t *output, uint32_t input)
{
    output[0] = (input >> 24) & 0xff;
    output[1] = (input >> 16) & 0xff;
    output[2] = (input >> 8) & 0xff;
    output[3] = (input) & 0xff;
    return 4;
}


/// @brief 
/// @param output 
/// @param input 
/// @return 
int UhfRfidDriver::_write_uint16_to_stream(uint8_t *output, uint16_t input)
{
    output[0] = (input >> 8) & 0xff;
    output[1] = (input) & 0xff;
    return 2;
}


/// @brief 
/// @param output 
/// @param input 
/// @return 
int UhfRfidDriver::_write_uint8_to_stream(uint8_t *output, uint8_t input)
{
    output[0] = input;
    return 1;
}
