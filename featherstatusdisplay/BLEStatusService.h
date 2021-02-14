#ifndef BLE_SVC_STATUS
#define BLE_SVC_STATUS
#define UUID16_SVC_STATUS 0x1851
#define UUID16_CHR_STATUS_CODE 0x2C50

#include "BLECharacteristic.h"
#include "BLEService.h"
#include "StatusCode.h"

class BLEStatusService : public BLEService
{
protected:
  static StatusCode _code;
  static void setStatusCode(StatusCode code);
  static void writeCallback(uint16_t conn_hdl, BLECharacteristic *chr, uint8_t *data, uint16_t len);

  BLECharacteristic _statusCode;

public:
  BLEStatusService(void);

  virtual err_t begin(void);
  static StatusCode getStatusCode();
};

#endif // BLE_SVC_STATUS
