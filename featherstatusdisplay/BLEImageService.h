#ifndef BLE_SVC_IMG
#define BLE_SVC_IMG
#define UUID16_SVC_IMG 0x1850

#include "BLECharacteristic.h"
#include "BLEService.h"

class BLEImageService : public BLEService
{
protected:
  BLECharacteristic _battery;

public:
  BLEImageService(void);

  virtual err_t begin(void);
};

#endif // BLE_SVC_IMG
