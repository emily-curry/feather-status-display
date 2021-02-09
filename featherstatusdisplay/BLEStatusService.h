#ifndef BLE_SVC_STATUS
#define BLE_SVC_STATUS
#define UUID16_SVC_STATUS 0x1851
#define UUID16_CHR_STATUS_CODE 0x2C50

#include "BLECharacteristic.h"
#include "BLEService.h"

class BLEStatusService : public BLEService
{
protected:
  BLECharacteristic _statusCode;

public:
  BLEStatusService(void);

  virtual err_t begin(void);
};

#endif // BLE_SVC_STATUS
