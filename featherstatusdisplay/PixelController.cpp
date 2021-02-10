#include "PixelController.h"

Adafruit_NeoPixel PixelController::_pixel = Adafruit_NeoPixel(1, PIN_NEOPIXEL);

void PixelController::begin()
{
  PixelController::_pixel.begin();
  PixelController::_pixel.setBrightness(32);
}

void PixelController::setColor(uint8_t red, uint8_t green, uint8_t blue)
{
  PixelController::_pixel.setPixelColor(0, red, green, blue);
  PixelController::_pixel.show();
}

void PixelController::off()
{
  PixelController::_pixel.clear();
}