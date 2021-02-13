#ifndef BLE_SVC_IMAGE
#define BLE_SVC_IMAGE
#define UUID16_SVC_IMAGE 0x1860
#define UUID16_CHR_IMAGE_WRITER 0x2C60
#define UUID16_CHR_IMAGE_CONTROL 0x2C61

#include "BLECharacteristic.h"
#include "BLEService.h"

class BLEImageService : public BLEService
{
protected:
  BLECharacteristic _imageWriter;
  BLECharacteristic _imageControl;

public:
  BLEImageService(void);

  virtual err_t begin(void);
};

#endif // BLE_SVC_IMAGE
