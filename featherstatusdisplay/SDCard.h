#ifndef APP_SDCARD
#define APP_SDCARD

#define SD_CS 5

#include "Adafruit_EPD.h"
#include <SdFat.h>

class SDCard
{
public:
  static SdFat sd;
  static void begin();
};

#endif // APP_SDCARD