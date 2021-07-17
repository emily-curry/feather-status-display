#ifndef APP_SDCARD
#define APP_SDCARD

#define SD_CS 5

#include "StatusCode.h"
#include "Adafruit_EPD.h"
#include <SdFat.h>

class SDCard
{
protected:
  static File _openFile;

public:
  static SdFat sd;
  static void begin();
  static const char *getFilenameForStatus(StatusCode status);
  static void openFile(StatusCode code);
  static boolean closeFile();
  static void writeAtPos(uint32_t pos, uint8_t *data, size_t len);
};

#endif // APP_SDCARD