#include "BLEStatusService.h"

BLEStatusService::BLEStatusService(void) : BLEService(UUID16_SVC_STATUS), _statusCode(UUID16_CHR_STATUS_CODE)
{
}

err_t BLEStatusService::begin(void)
{
  VERIFY_STATUS(BLEService::begin());

  _statusCode.setProperties(CHR_PROPS_NOTIFY);
  _statusCode.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  _statusCode.setFixedLen(2);
  // _statusCode.setCccdWriteCallback(cccd_callback); // Optionally capture CCCD updates
  _statusCode.begin();

  return ERROR_NONE;
}