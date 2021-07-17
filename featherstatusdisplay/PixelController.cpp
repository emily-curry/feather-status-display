#include "PixelController.h"

Adafruit_NeoPixel PixelController::_pixel = Adafruit_NeoPixel(1, PIN_NEOPIXEL);
boolean PixelController::isError = false;

void PixelController::begin()
{
#ifdef PIXEL_ENABLE
  PixelController::_pixel.begin();
  PixelController::_pixel.setBrightness(16);
#endif
}

void PixelController::setColor(uint8_t red, uint8_t green, uint8_t blue)
{
#ifdef PIXEL_ENABLE
  PixelController::_pixel.setBrightness(16);
  PixelController::_pixel.setPixelColor(0, red, green, blue);
  PixelController::_pixel.show();
#endif
}

void PixelController::setBusyRead()
{
  PixelController::setColor(255, 255, 0);
}

void PixelController::setBusyWrite()
{
  PixelController::setColor(0, 255, 255);
}

void PixelController::setError()
{
  Serial.println("Uh oh! Setting error LED");
  PixelController::setColor(255, 0, 0);
  PixelController::isError = true;
}

void PixelController::setSuccess()
{
  PixelController::setColor(0, 255, 0);
}

void PixelController::off()
{
#ifdef PIXEL_ENABLE
  PixelController::_pixel.clear();
  PixelController::_pixel.show();
#endif
}