#include "BLEBatteryService.h"

BLEBatteryService::BLEBatteryService(void) : BLEBas() {}

err_t BLEBatteryService::begin(void)
{
  BLEBas::setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  VERIFY_STATUS(BLEBas::begin());

  this->update();

  return ERROR_NONE;
}

void BLEBatteryService::update()
{
  uint8_t charge = BLEBatteryService::getCharge();
  this->write(charge);
  this->notify(charge);
}

uint8_t BLEBatteryService::getCharge()
{
  float measuredvbat = analogRead(A6);
  measuredvbat *= 2;    // we divided by 2, so multiply back
  measuredvbat *= 3.3;  // Multiply by 3.3V, our reference voltage
  measuredvbat /= 1024; // convert to voltage
  Serial.print("VBat: ");
  Serial.println(measuredvbat);
  measuredvbat -= 3.2;
  measuredvbat *= 100;
  if (measuredvbat > 100)
    return 100;
  if (measuredvbat < 0)
    return 0;
  uint8_t percent = round(measuredvbat);
  return percent;
}