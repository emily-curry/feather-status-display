#include "bluefruit.h"
#include "ButtonController.h"

ButtonController::ButtonController(void)
{
  handled = false;
  pinMode(BUTTON_A, INPUT);
  pinMode(BUTTON_B, INPUT);
  pinMode(BUTTON_C, INPUT);
}

Button ButtonController::readButton()
{
  if (digitalRead(BUTTON_A) == LOW)
  {
    return ButtonA;
  }

  if (digitalRead(BUTTON_B) == LOW)
  {
    return ButtonB;
  }

  if (digitalRead(BUTTON_C) == LOW)
  {
    return ButtonC;
  }

  return ButtonNone;
}

void ButtonController::update()
{
  Button pressed = readButton();
  if (pressed == ButtonNone)
  {
    handled = false;
  }
  if (handled == true)
  {
    return;
  }

  switch (pressed)
  {
  case ButtonA:
    Serial.println("Button A pressed");
    NRF_POWER->SYSTEMOFF = 1;
    handled = true;
    break;
  case ButtonB:
    Serial.println("Button B pressed");
    handled = true;
    break;
  case ButtonC:
    Serial.println("Button C pressed");
    handled = true;
    break;
  default:
    break;
  }
}