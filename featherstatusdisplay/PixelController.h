#ifndef APP_PIXEL_CONTROLLER
#define APP_PIXEL_CONTROLLER

#include "Adafruit_NeoPixel.h"

class PixelController
{
protected:
  static Adafruit_NeoPixel _pixel;

public:
  static void begin();

  static void setColor(uint8_t red, uint8_t green, uint8_t blue);

  static void off();
};

#endif // APP_PIXEL_CONTROLLER
