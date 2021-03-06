#ifndef APP_PIXEL_CONTROLLER
#define APP_PIXEL_CONTROLLER

#include "Adafruit_NeoPixel.h"

class PixelController
{
protected:
  static Adafruit_NeoPixel _pixel;
  static boolean isError;

public:
  static void begin();
  static void off();
  static void setError();
  static void setBusyRead();
  static void setBusyWrite();
  static void setSuccess();
  static void setColor(uint8_t red, uint8_t green, uint8_t blue);
};

#endif // APP_PIXEL_CONTROLLER
