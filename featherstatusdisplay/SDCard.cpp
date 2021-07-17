#include "SDCard.h"
#include "StatusCode.h"

const char *file_offline = "00.bmp";
const char *file_unknown = "01.bmp";
SdFat SDCard::sd = SdFat();
File SDCard::_openFile = {};

void SDCard::begin()
{
  SDCard::sd.begin(SD_CS);
}

const char *SDCard::getFilenameForStatus(StatusCode code)
{
  switch (code)
  {
  case STATUS_OFFLINE:
    return file_offline;
  case STATUS_UNKNOWN:
  default:
    return file_unknown;
  }
}

void SDCard::openFile(StatusCode code)
{
  SDCard::_openFile = SDCard::sd.open(SDCard::getFilenameForStatus(code), FILE_WRITE);
}

boolean SDCard::closeFile()
{
  return SDCard::_openFile.close();
}

void SDCard::writeAtPos(uint32_t pos, uint8_t *data, size_t len)
{
  if (!SDCard::_openFile)
  {
    Serial.println("Could not write to file, no file currently open");
    return;
  }

  SDCard::_openFile.seek(pos);
  SDCard::_openFile.write(data, len);
}