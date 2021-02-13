#include "BLEImageService.h"

BLEImageService::BLEImageService(void) : BLEService(UUID16_SVC_IMAGE), _imageWriter(UUID16_CHR_IMAGE_WRITER), _imageControl(UUID16_CHR_IMAGE_CONTROL)
{
}

err_t BLEImageService::begin(void)
{
  VERIFY_STATUS(BLEService::begin());

  return ERROR_NONE;
}