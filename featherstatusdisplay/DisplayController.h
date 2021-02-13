#ifndef APP_DISPLAY
#define APP_DISPLAY

#include "Adafruit_ThinkInk.h"
#include "StatusCode.h"
#include "Adafruit_ImageReader_EPD.h"

#define EPD_DC 10   // can be any pin, but required!
#define EPD_CS 9    // can be any pin, but required!
#define EPD_BUSY 7  // can set to -1 to not use a pin (will wait a fixed delay)
#define SRAM_CS 6   // can set to -1 to not use a pin (uses a lot of RAM!)
#define EPD_RESET 8 // can set to -1 and share with chip Reset (can't deep sleep)

class DisplayController
{
protected:
  static ThinkInk_290_Grayscale4_T5 _display;
  static Adafruit_ImageReader_EPD _reader;

public:
  static void begin();

  static void displayCode(StatusCode);
};

#endif // APP_DISPLAY