#include "PixelController.h"

Adafruit_NeoPixel PixelController::_pixel = Adafruit_NeoPixel(1, PIN_NEOPIXEL);
boolean PixelController::isError = false;

void PixelController::begin()
{
  PixelController::_pixel.begin();
  PixelController::_pixel.setBrightness(16);
}

void PixelController::setColor(uint8_t red, uint8_t green, uint8_t blue)
{
  if (PixelController::isError)
  {
    return;
  }

  PixelController::_pixel.setBrightness(16);
  PixelController::_pixel.setPixelColor(0, red, green, blue);
  PixelController::_pixel.show();
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
  if (PixelController::isError)
  {
    return;
  }

  PixelController::_pixel.setPixelColor(0, 0, 0, 0);
  PixelController::_pixel.show();
}