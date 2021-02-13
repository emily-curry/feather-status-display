#include "SDCard.h"

SdFat SDCard::sd = SdFat();

void SDCard::begin()
{
  SDCard::sd.begin(SD_CS);
}