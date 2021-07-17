#include "BLEImageService.h"
#include "PixelController.h"
#include "SDCard.h"

// buffer to hold incoming image data
uint8_t imageBuffer[242];

BLEImageService::BLEImageService(void) : BLEService(UUID16_SVC_IMAGE), _imageWriter(UUID16_CHR_IMAGE_WRITER), _imageControl(UUID16_CHR_IMAGE_CONTROL)
{
}

err_t BLEImageService::begin(void)
{
  VERIFY_STATUS(BLEService::begin());

  _imageWriter.setProperties(CHR_PROPS_WRITE);
  _imageWriter.setPermission(SECMODE_OPEN, SECMODE_OPEN);
  _imageWriter.setMaxLen(512);
  _imageWriter.setWriteCallback(BLEImageService::writerCallback);
  _imageWriter.setUserDescriptor("Image Write Data");
  _imageWriter.begin();

  _imageControl.setProperties(CHR_PROPS_WRITE);
  _imageControl.setPermission(SECMODE_OPEN, SECMODE_OPEN);
  _imageControl.setMaxLen(2);
  _imageControl.setWriteCallback(BLEImageService::controlCallback);
  _imageControl.setUserDescriptor("Image Write Control");
  _imageControl.begin();

  return ERROR_NONE;
}

void BLEImageService::writerCallback(uint16_t conn_hdl, BLECharacteristic *chr, uint8_t *data, uint16_t len)
{
  PixelController::setBusyWrite();
  uint32_t pos = *((uint32_t *)data); // cast data as ptr to uint32 value, then deref
  uint16_t dataSize = len - 4;

  Serial.print("Image Writer - Data Received - Offset ");
  Serial.print(pos);
  Serial.print(" - Size ");
  Serial.println(dataSize);

  uint8_t *dataPtr = data + 4;
  SDCard::writeAtPos(pos, dataPtr, dataSize);
  PixelController::off();
}

void BLEImageService::controlCallback(uint16_t conn_hdl, BLECharacteristic *chr, uint8_t *data, uint16_t len)
{
  // First byte = Command; 1 = Open, 2 = Close;
  uint8_t cmd = chr->read8();
  if (cmd == 1)
  {
    PixelController::setBusyRead();
    // Second byte = Status Code
    StatusCode code = toStatusCode(chr->read8());
    Serial.print("Image Writer - Command Received - Open File ");
    Serial.println(code);
    SDCard::openFile(code);
    PixelController::off();
  }
  else if (cmd == 2)
  {
    Serial.println("Image Writer - Command Received - Close File");
    boolean success = SDCard::closeFile();
    if (!success)
    {
      Serial.println("Failed to close file");
      PixelController::setError();
    }
  }
}