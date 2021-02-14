#include "BLEStatusService.h"
#include "PixelController.h"
#include "DisplayController.h"

StatusCode BLEStatusService::_code = StatusCode::STATUS_UNKNOWN;

BLEStatusService::BLEStatusService(void) : BLEService(UUID16_SVC_STATUS), _statusCode(UUID16_CHR_STATUS_CODE)
{
}

err_t BLEStatusService::begin(void)
{
  VERIFY_STATUS(BLEService::begin());
  BLEStatusService::setStatusCode(StatusCode::STATUS_UNKNOWN);

  _statusCode.setProperties(CHR_PROPS_WRITE_WO_RESP);
  _statusCode.setPermission(SECMODE_OPEN, SECMODE_OPEN);
  _statusCode.setFixedLen(1);
  _statusCode.setWriteCallback(BLEStatusService::writeCallback);
  _statusCode.setUserDescriptor("Status Code");
  _statusCode.begin();

  return ERROR_NONE;
}

StatusCode BLEStatusService::getStatusCode()
{
  return BLEStatusService::_code;
}

void BLEStatusService::writeCallback(uint16_t conn_hdl, BLECharacteristic *chr, uint8_t *data, uint16_t len)
{
  uint8_t code = chr->read8();
  BLEStatusService::setStatusCode(toStatusCode(code));
}

void BLEStatusService::setStatusCode(StatusCode code)
{
  PixelController::setBusyRead();
  Serial.print("Status code set: ");
  Serial.println(code);
  BLEStatusService::_code = code;
  DisplayController::displayCode(code);
  PixelController::off();
}