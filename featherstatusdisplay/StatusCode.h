#ifndef APP_STATUS_CODE
#define APP_STATUS_CODE

#include <Arduino.h>

enum StatusCode
{
  STATUS_OFFLINE = 0,
  STATUS_UNKNOWN = 1,
  STATUS_BUSY = 2,
  STATUS_DND = 3,
  STATUS_AVAILABLE = 4,
  STATUS_MEETING = 5,
  STATUS_BRB = 6,
  STATUS_OOO = 7,
};

StatusCode toStatusCode(uint8_t i);

#endif // APP_STATUS_CODE