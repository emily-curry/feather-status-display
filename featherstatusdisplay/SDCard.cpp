#include "SDCard.h"
#include "StatusCode.h"

const char *file_offline = "00.bmp";
const char *file_unknown = "01.bmp";
const char *file_busy = "02.bmp";
const char *file_dnd = "03.bmp";
const char *file_available = "04.bmp";
const char *file_meeting = "05.bmp";
const char *file_brb = "06.bmp";
const char *file_ooo = "07.bmp";
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
  case STATUS_BUSY:
    return file_busy;
  case STATUS_DND:
    return file_dnd;
  case STATUS_AVAILABLE:
    return file_available;
  case STATUS_MEETING:
    return file_meeting;
  case STATUS_BRB:
    return file_brb;
  case STATUS_OOO:
    return file_ooo;
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