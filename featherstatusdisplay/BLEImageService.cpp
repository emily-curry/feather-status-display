#include "BLEImageService.h"

BLEImageService::BLEImageService(void) : BLEService(UUID16_SVC_IMG), _battery(UUID16_CHR_HEART_RATE_MEASUREMENT)
{
}

err_t BLEImageService::begin(void)
{
  VERIFY_STATUS(BLEService::begin());

  return ERROR_NONE;
}