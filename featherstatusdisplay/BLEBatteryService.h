#ifndef BATTERY_SERVICE
#define BATTERY_SERVICE

#include "bluefruit.h"

class BLEBatteryService : public BLEBas
{
protected:
  static uint8_t getCharge();

public:
  BLEBatteryService(void);

  virtual err_t begin(void);
  void update(void);
};

#endif // BATTERY_SERVICE