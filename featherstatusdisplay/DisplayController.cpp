#include "DisplayController.h"
#include "SDCard.h"

const char *file_unknown = "00.bmp";

ThinkInk_290_Grayscale4_T5 DisplayController::_display = ThinkInk_290_Grayscale4_T5(EPD_DC, EPD_RESET, EPD_CS, SRAM_CS, EPD_BUSY);
Adafruit_ImageReader_EPD DisplayController::_reader = Adafruit_ImageReader_EPD(SDCard::sd);

void DisplayController::begin()
{
  DisplayController::_display.begin(THINKINK_GRAYSCALE4);
  DisplayController::displayCode(StatusCode::STATUS_UNKNOWN);
}

const char *getFilenameForStatusCode(StatusCode code)
{
  switch (code)
  {
  case STATUS_UNKNOWN:
  default:
    return file_unknown;
  }
}

void DisplayController::displayCode(StatusCode code)
{
  const char *filename = getFilenameForStatusCode(code);
  Serial.print("Loading file: ");
  Serial.println(filename);
  ImageReturnCode stat = DisplayController::_reader.drawBMP((char *)filename, DisplayController::_display, 0, 0);
  DisplayController::_reader.printStatus(stat, Serial);
  DisplayController::_display.display();
}